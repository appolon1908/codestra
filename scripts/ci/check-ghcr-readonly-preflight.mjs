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

const forbiddenEvents = /^\s{2}(push|pull_request|pull_request_target|schedule|workflow_run):/gm
if (forbiddenEvents.test(workflow)) {
  failures.push(`${workflowPath}: registry preflight must be workflow_dispatch-only`)
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

if (failures.length > 0) {
  console.error('\nGHCR read-only preflight policy failed:\n')
  for (const failure of failures) {
    console.error(`- ${failure}`)
  }
  process.exit(1)
}

console.log('GHCR read-only preflight policy passed.')
