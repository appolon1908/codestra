import { writeFileSync } from 'node:fs'

const required = (name, pattern) => {
  const value = process.env[name] ?? ''
  if (!pattern.test(value)) {
    throw new Error(`${name} is missing or invalid`)
  }
  return value
}

const repository = required(
  'GITHUB_REPOSITORY',
  /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/,
)
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
const cosignVerificationSha256 = required(
  'COSIGN_VERIFICATION_SHA256',
  /^[a-f0-9]{64}$/,
)
const signatureIdentity = required(
  'SIGNATURE_IDENTITY',
  /^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\/\.github\/workflows\/release-image\.yml@refs\/heads\/main$/,
)
const signatureIssuer = required(
  'SIGNATURE_ISSUER',
  /^https:\/\/token\.actions\.githubusercontent\.com$/,
)
const provenanceMode = required('PROVENANCE_MODE', /^buildkit-max$/)

const expectedSignatureIdentity =
  `https://github.com/${repository}/.github/workflows/release-image.yml@refs/heads/main`
if (signatureIdentity !== expectedSignatureIdentity) {
  throw new Error('SIGNATURE_IDENTITY does not match the repository release workflow')
}

const manifest = {
  schemaVersion: 1,
  repository,
  workflowRunId: process.env.GITHUB_RUN_ID,
  workflowRunAttempt: process.env.GITHUB_RUN_ATTEMPT,
  sourceSha,
  imageRef,
  imageDigest: imageRef.slice(imageRef.indexOf('@') + 1),
  viteApiEndpoint: apiEndpoint,
  createdAt: new Date().toISOString(),
  sbomSha256,
  scanSha256,
  cosignVerificationSha256,
  signatureIdentity,
  signatureIssuer,
  provenanceMode,
}

writeFileSync(
  'release-manifest.json',
  `${JSON.stringify(manifest, null, 2)}\n`,
  { mode: 0o600 },
)
console.log(`Release manifest written for ${imageRef}`)
