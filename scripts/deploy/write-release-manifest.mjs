import { writeFileSync } from 'node:fs'

const required = (name, pattern) => {
  const value = process.env[name] ?? ''
  if (!pattern.test(value)) {
    throw new Error(`${name} is missing or invalid`)
  }
  return value
}

const sourceSha = required('SOURCE_SHA', /^[a-f0-9]{40}$/)
const imageRef = required(
  'IMAGE_REF',
  /^ghcr\.io\/[a-z0-9_.-]+\/[a-z0-9_.-]+@sha256:[a-f0-9]{64}$/,
)
const apiEndpoint = required(
  'VITE_API_ENDPOINT',
  /^https:\/\/[a-zA-Z0-9.-]+(?::[0-9]{2,5})?(?:\/.*)?$/,
)
const sbomSha256 = required('SBOM_SHA256', /^[a-f0-9]{64}$/)
const scanSha256 = required('SCAN_SHA256', /^[a-f0-9]{64}$/)

const manifest = {
  schemaVersion: 1,
  repository: process.env.GITHUB_REPOSITORY,
  workflowRunId: process.env.GITHUB_RUN_ID,
  workflowRunAttempt: process.env.GITHUB_RUN_ATTEMPT,
  sourceSha,
  imageRef,
  imageDigest: imageRef.slice(imageRef.indexOf('@') + 1),
  viteApiEndpoint: apiEndpoint,
  createdAt: new Date().toISOString(),
  sbomSha256,
  scanSha256,
}

writeFileSync(
  'release-manifest.json',
  `${JSON.stringify(manifest, null, 2)}\n`,
  { mode: 0o600 },
)
console.log(`Release manifest written for ${imageRef}`)
