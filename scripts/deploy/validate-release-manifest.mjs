import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const args = process.argv.slice(2)
const option = (name) => {
  const index = args.indexOf(name)
  return index === -1 ? '' : args[index + 1]
}

const file = option('--file')
const expectedSourceSha = option('--source-sha')
const expectedImageDigest = option('--image-digest')
const expectedRepository = process.env.GITHUB_REPOSITORY || 'appolon1908-hue/codestra'

const failures = []
const requireValue = (condition, message) => {
  if (!condition) failures.push(message)
}

requireValue(
  /^deploy\/releases\/[a-f0-9]{40}\.json$/.test(file),
  'release manifest path must be deploy/releases/<40-char-sha>.json',
)
requireValue(/^[a-f0-9]{40}$/.test(expectedSourceSha), 'expected source SHA is invalid')
requireValue(
  /^sha256:[a-f0-9]{64}$/.test(expectedImageDigest),
  'expected image digest is invalid',
)

let manifest
try {
  manifest = JSON.parse(readFileSync(resolve(file), 'utf8'))
} catch (error) {
  console.error(`Unable to read release manifest ${file}: ${error.message}`)
  process.exit(1)
}

const expectedImageRef =
  `ghcr.io/${expectedRepository.toLowerCase()}@${expectedImageDigest}`

requireValue(manifest.schemaVersion === 1, 'schemaVersion must equal 1')
requireValue(manifest.repository === expectedRepository, 'repository identity does not match')
requireValue(manifest.sourceSha === expectedSourceSha, 'sourceSha does not match deployment input')
requireValue(manifest.imageDigest === expectedImageDigest, 'imageDigest does not match deployment input')
requireValue(manifest.imageRef === expectedImageRef, 'imageRef does not match repository and digest')
requireValue(
  /^https:\/\/[a-zA-Z0-9.-]+(?::[0-9]{2,5})?(?:\/.*)?$/.test(
    manifest.viteApiEndpoint ?? '',
  ),
  'viteApiEndpoint must be HTTPS',
)
requireValue(/^[a-f0-9]{64}$/.test(manifest.sbomSha256 ?? ''), 'sbomSha256 is invalid')
requireValue(/^[a-f0-9]{64}$/.test(manifest.scanSha256 ?? ''), 'scanSha256 is invalid')
requireValue(
  typeof manifest.workflowRunId === 'string' && /^[0-9]+$/.test(manifest.workflowRunId),
  'workflowRunId is invalid',
)
requireValue(
  typeof manifest.workflowRunAttempt === 'string'
    && /^[0-9]+$/.test(manifest.workflowRunAttempt),
  'workflowRunAttempt is invalid',
)

const createdAt = Date.parse(manifest.createdAt)
requireValue(Number.isFinite(createdAt), 'createdAt must be an ISO-8601 timestamp')
requireValue(
  !Number.isFinite(createdAt) || createdAt <= Date.now() + 60_000,
  'createdAt must not be in the future',
)

if (failures.length > 0) {
  console.error('Release manifest validation failed:')
  for (const failure of failures) {
    console.error(`- ${failure}`)
  }
  process.exit(1)
}

console.log(`Release manifest ${file} passed validation.`)
