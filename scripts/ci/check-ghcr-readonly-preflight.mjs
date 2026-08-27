import { readFileSync } from 'node:fs'

const workflowPath = '.github/workflows/ghcr-readonly-preflight.yml'
const staticWorkflowPath = '.github/workflows/ghcr-readonly-preflight-static.yml'
const helperPath = 'scripts/registry/ghcr-readonly-preflight.sh'
const fixturePath = 'scripts/ci/test-ghcr-readonly-preflight-fixture.sh'

const workflow = readFileSync(workflowPath, 'utf8')
const staticWorkflow = readFileSync(staticWorkflowPath, 'utf8')
const helper = readFileSync(helperPath, 'utf8')
const fixture = readFileSync(fixturePath, 'utf8')
const failures = []

const requireText = (source, marker, location) => {
  if (!source.includes(marker)) {
    failures.push(`${location}: missing required marker: ${marker}`)
  }
}

const stripYamlComment = (line) => {
  let inSingleQuote = false
  let inDoubleQuote = false
  let escaped = false

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index]

    if (inDoubleQuote) {
      if (escaped) {
        escaped = false
      } else if (character === '\\') {
        escaped = true
      } else if (character === '"') {
        inDoubleQuote = false
      }
      continue
    }

    if (inSingleQuote) {
      if (character === "'" && line[index + 1] === "'") {
        index += 1
      } else if (character === "'") {
        inSingleQuote = false
      }
      continue
    }

    if (character === '"') {
      inDoubleQuote = true
    } else if (character === "'") {
      inSingleQuote = true
    } else if (character === '#') {
      return line.slice(0, index)
    }
  }

  return line
}

const getStructuralLines = (source) => {
  const structural = []
  const parserFailures = []
  const rawLines = source.split(/\r?\n/)
  let blockScalarParentIndent = null

  rawLines.forEach((rawLine, index) => {
    if (rawLine.includes('\t')) {
      parserFailures.push(`line ${index + 1}: YAML tabs are not permitted`)
      return
    }

    const indent = rawLine.match(/^ */)?.[0].length ?? 0
    const rawTrimmed = rawLine.trim()

    if (blockScalarParentIndent !== null) {
      if (rawTrimmed === '') {
        return
      }
      if (indent > blockScalarParentIndent) {
        return
      }
      blockScalarParentIndent = null
    }

    const withoutComment = stripYamlComment(rawLine).trimEnd()
    if (withoutComment.trim() === '') {
      return
    }

    const text = withoutComment.trimStart()
    structural.push({
      lineNumber: index + 1,
      indent,
      text,
    })

    if (/:\s*[>|][+-]?\s*$/.test(text)) {
      blockScalarParentIndent = indent
    }
  })

  return { structural, parserFailures }
}

const parseTopLevelBlock = (source, key) => {
  const { structural, parserFailures } = getStructuralLines(source)
  const errors = [...parserFailures]
  const headerPattern = new RegExp(`^${key}:(.*)$`)
  const headers = structural.filter(
    (line) => line.indent === 0 && headerPattern.test(line.text),
  )

  if (headers.length !== 1) {
    errors.push(`top-level ${key} block must appear exactly once; found ${headers.length}`)
    return { errors, entries: [], lines: structural, blockLines: [] }
  }

  const header = headers[0]
  const headerMatch = header.text.match(headerPattern)
  if (!headerMatch || headerMatch[1].trim() !== '') {
    errors.push(`top-level ${key} must use canonical block mapping syntax`)
  }

  const headerIndex = structural.indexOf(header)
  let endIndex = structural.length
  for (let index = headerIndex + 1; index < structural.length; index += 1) {
    if (structural[index].indent === 0) {
      endIndex = index
      break
    }
  }

  const blockLines = structural.slice(headerIndex + 1, endIndex)
  const entries = []

  for (const line of blockLines) {
    if (line.indent < 2) {
      errors.push(`line ${line.lineNumber}: invalid indentation in ${key} block`)
      continue
    }

    if (line.indent !== 2) {
      continue
    }

    const entryMatch = line.text.match(/^([A-Za-z0-9_<>=.-]+):(.*)$/)
    if (!entryMatch) {
      errors.push(`line ${line.lineNumber}: invalid immediate ${key} entry`)
      continue
    }

    entries.push({
      key: entryMatch[1],
      value: entryMatch[2].trim(),
      lineNumber: line.lineNumber,
    })
  }

  return { errors, entries, lines: structural, blockLines }
}

const validateManualTrigger = (source) => {
  const parsed = parseTopLevelBlock(source, 'on')
  const errors = [...parsed.errors]

  if (
    parsed.entries.length !== 1
    || parsed.entries[0].key !== 'workflow_dispatch'
    || parsed.entries[0].value !== ''
  ) {
    const rendered = parsed.entries
      .map(({ key, value }) => `${key}${value ? `=${value}` : ''}`)
      .join(', ') || 'NONE'
    errors.push(`on keys must be exactly workflow_dispatch; found ${rendered}`)
  }

  return errors
}

const validatePermissionMap = (source) => {
  const parsed = parseTopLevelBlock(source, 'permissions')
  const errors = [...parsed.errors]
  const expected = new Map([
    ['contents', 'read'],
    ['packages', 'read'],
  ])
  const seen = new Map()

  for (const entry of parsed.entries) {
    if (seen.has(entry.key)) {
      errors.push(`line ${entry.lineNumber}: duplicate permission scope ${entry.key}`)
      continue
    }
    seen.set(entry.key, entry.value)
  }

  if (seen.size !== expected.size) {
    errors.push(
      `top-level permissions must contain only contents: read and packages: read; found ${[
        ...seen.keys(),
      ].join(', ') || 'NONE'}`,
    )
  }

  for (const [scope, value] of expected) {
    if (seen.get(scope) !== value) {
      errors.push(`permission ${scope} must be exactly ${value}`)
    }
  }

  for (const entry of parsed.entries) {
    if (!expected.has(entry.key)) {
      errors.push(`line ${entry.lineNumber}: unapproved permission scope ${entry.key}`)
    }
  }

  const nestedPermissionLines = parsed.blockLines.filter(
    (line) => line.indent > 2,
  )
  if (nestedPermissionLines.length > 0) {
    errors.push('top-level permissions must be a flat scalar map')
  }

  const jobs = parseTopLevelBlock(source, 'jobs')
  errors.push(...jobs.errors.map((error) => `jobs parser: ${error}`))

  const jobEntries = jobs.entries
  const structural = jobs.lines
  for (const job of jobEntries) {
    const jobLineIndex = structural.findIndex(
      (line) => line.lineNumber === job.lineNumber,
    )
    let jobEndIndex = structural.length

    for (let index = jobLineIndex + 1; index < structural.length; index += 1) {
      const line = structural[index]
      if (line.indent === 0 || line.indent === 2) {
        jobEndIndex = index
        break
      }
    }

    for (const line of structural.slice(jobLineIndex + 1, jobEndIndex)) {
      if (line.indent === 4 && /^permissions:(?:.*)$/.test(line.text)) {
        errors.push(
          `line ${line.lineNumber}: job-level permissions override is not permitted`,
        )
      }
    }
  }

  return errors
}

const validateControlPlane = (source) => [
  ...validateManualTrigger(source),
  ...validatePermissionMap(source),
]

for (const error of validateControlPlane(workflow)) {
  failures.push(`${workflowPath}: ${error}`)
}

const requireMutation = (source, before, after, label) => {
  if (!source.includes(before)) {
    failures.push(`${workflowPath}: cannot build ${label} policy fixture`)
    return source
  }
  return source.replace(before, after)
}

const negativePolicyFixtures = [
  [
    'repository_dispatch event',
    requireMutation(
      workflow,
      '  workflow_dispatch:\n',
      '  workflow_dispatch:\n  repository_dispatch:\n',
      'repository_dispatch event',
    ),
  ],
  [
    'workflow_call event',
    requireMutation(
      workflow,
      '  workflow_dispatch:\n',
      '  workflow_dispatch:\n  workflow_call:\n',
      'workflow_call event',
    ),
  ],
  [
    'extra top-level write permission',
    requireMutation(
      workflow,
      '  packages: read\n',
      '  packages: read\n  actions: write\n',
      'extra top-level write permission',
    ),
  ],
  [
    'job-level write-all override',
    requireMutation(
      workflow,
      '  inspect:\n',
      '  inspect:\n    permissions: write-all\n',
      'job-level write-all override',
    ),
  ],
]

for (const [label, mutatedWorkflow] of negativePolicyFixtures) {
  if (validateControlPlane(mutatedWorkflow).length === 0) {
    failures.push(`${workflowPath}: policy self-test accepted ${label}`)
  }
}

for (const marker of [
  'workflow_dispatch:',
  'READ_ONLY_GHCR_PREFLIGHT',
  'permissions:\n  contents: read\n  packages: read',
  'GITHUB_REF',
  'refs/heads/main',
  'GHCR_REPOSITORY: ghcr.io/appolon1908-hue/codestra',
  'CANDIDATE_INPUT: ${{ inputs.candidate_reference }}',
  'GHCR_USER: ${{ github.actor }}',
  'GHCR_TOKEN: ${{ secrets.GITHUB_TOKEN }}',
  'docker login ghcr.io',
  'docker logout ghcr.io',
  'PREFLIGHT_REMOTE_WRITE_COUNT=0',
  'LIVE_SERVER_CONTACTED=NO',
  'IMAGE_PUSHED=NO',
  'IMAGE_PULLED=NO',
  'DEPLOYMENT_STARTED=NO',
  'retention-days: 14',
  'if: always()',
]) {
  requireText(workflow, marker, workflowPath)
}

for (const marker of [
  'docker buildx imagetools inspect',
  "reference_pattern='^ghcr\\.io/appolon1908-hue/codestra",
  "digest_pattern='^sha256:[0-9a-f]{64}$'",
  'package_access NOT_FOUND',
  'package_access DENIED',
  'digest_validation FAIL',
  'digest_validation PASS',
]) {
  requireText(helper, marker, helperPath)
}

for (const marker of [
  'pull_request:',
  'branches:\n      - main',
  'node scripts/ci/check-ghcr-readonly-preflight.mjs',
  'bash scripts/ci/test-ghcr-readonly-preflight-fixture.sh',
]) {
  requireText(staticWorkflow, marker, staticWorkflowPath)
}

const forbidden = [
  'packages: write',
  'id-token: write',
  'environment: production',
  'GHCR_PULL_TOKEN',
  'GHCR_USER: ${{ secrets.',
  'DEPLOY_HOST',
  'DEPLOY_USER',
  'DEPLOY_SSH_KEY',
  'DEPLOY_KNOWN_HOSTS',
  'pull_request_target:',
  'docker compose',
  'docker pull',
  'docker push',
  'docker build ',
  'scp ',
  'rsync ',
  'ssh ',
  'curl -H',
  'Authorization:',
]

for (const marker of forbidden) {
  if (workflow.includes(marker) || helper.includes(marker)) {
    failures.push(`read-only GHCR preflight contains forbidden marker: ${marker}`)
  }
}

const inputInterpolationCount = (
  workflow.match(/\$\{\{\s*inputs\.candidate_reference\s*\}\}/g) ?? []
).length

if (inputInterpolationCount !== 1) {
  failures.push(
    `${workflowPath}: candidate_reference must appear exactly once and only through an environment variable`,
  )
}

for (const [location, source] of [
  [workflowPath, workflow],
  [staticWorkflowPath, staticWorkflow],
]) {
  const usesLines = source
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('uses: '))

  for (const line of usesLines) {
    if (!/@[0-9a-f]{40}$/.test(line)) {
      failures.push(`${location}: action is not pinned to a full commit SHA: ${line}`)
    }
  }
}

if (/\bdocker\s+(?:pull|push|compose|build(?:\s|$))/m.test(helper)) {
  failures.push(`${helperPath}: only docker buildx imagetools inspect is permitted`)
}

if (!fixture.includes('MOCK_INSPECT_MODE')) {
  failures.push(`${fixturePath}: descriptor-only fixture coverage is missing`)
}

if (!fixture.includes('no_platform')) {
  failures.push(`${fixturePath}: platformless descriptor fixture coverage is missing`)
}

if (failures.length > 0) {
  console.error('\nGHCR read-only preflight policy failed:\n')
  for (const failure of failures) {
    console.error(`- ${failure}`)
  }
  process.exit(1)
}

console.log('GHCR read-only preflight policy passed.')
