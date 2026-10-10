import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const requiredFiles = [
  '.github/workflows/ci.yml',
  'deploy/reference-release-image.yml',
  'deploy/reference-runtime-preflight.yml',
  '.github/workflows/deploy.yml',
  'deploy/runtime-paths.production.json',
  'deploy/compose.production.yaml',
  'scripts/deploy/validate-runtime-manifest.mjs',
  'scripts/deploy/validate-release-manifest.mjs',
  'scripts/deploy/read-only-preflight.sh',
  'scripts/deploy/activate-release.sh',
  'scripts/deploy/rollback-release.sh',
  'scripts/deploy/write-release-manifest.mjs',
  'deploy/releases/README.md',
  'docs/deployment-security.md',
]

const failures = []
const read = (path) => readFileSync(resolve(path), 'utf8')

for (const path of requiredFiles) {
  if (!existsSync(resolve(path))) {
    failures.push(`${path}: required deployment-scaffold file is missing`)
  }
}

if (failures.length === 0) {
  const deployWorkflow = read('deploy/reference-production-activation.yml')
  const releaseWorkflow = read('deploy/reference-release-image.yml')
  const preflightWorkflow = read('deploy/reference-runtime-preflight.yml')
  const preflightScript = read('scripts/deploy/read-only-preflight.sh')
  const activationScript = read('scripts/deploy/activate-release.sh')
  const rollbackScript = read('scripts/deploy/rollback-release.sh')
  const productionCompose = read('deploy/compose.production.yaml')
  const manifest = JSON.parse(read('deploy/runtime-paths.production.json'))

  const activeWorkflow = read('.github/workflows/deploy.yml');
  if (!activeWorkflow.includes('Build immutable candidate image (no deployment)') || activeWorkflow.includes('activate-release.sh')) failures.push('Active workflow must preserve candidate-only production boundary');

  const requiredDeployMarkers = [
    'runtime_manifest_sha256',
    'release_manifest_sha256',
    'release_manifest_path',
    'image_digest',
    'DEPLOY_VERIFIED_RUNTIME',
    '--mode deploy',
    'environment: production',
    'cancel-in-progress: false',
    'ghcr.io/${GITHUB_REPOSITORY,,}@${IMAGE_DIGEST}',
    "steps.public_smoke.outcome == 'failure'",
    'rollback-release.sh',
    'sigstore/cosign-installer@6f9f17788090df1f26f669e9d70d6ae9567deba6',
    'cosign verify',
    "grep -Fx 'PREFLIGHT_READINESS=PASS'",
    'activation',
  ]

  for (const marker of requiredDeployMarkers) {
    if (!deployWorkflow.includes(marker)) {
      failures.push(`.github/workflows/deploy.yml: missing fail-closed marker: ${marker}`)
    }
  }

  for (const forbidden of [
    'mv compose.yaml.next compose.yaml',
    'StrictHostKeyChecking=no',
    'PasswordAuthentication=yes',
    'curl | sh',
    'wget | sh',
  ]) {
    if (
      deployWorkflow.includes(forbidden)
      || releaseWorkflow.includes(forbidden)
      || preflightWorkflow.includes(forbidden)
    ) {
      failures.push(`workflow contains forbidden deployment pattern: ${forbidden}`)
    }
  }

  const remoteWritePattern =
    /\b(?:mkdir|install|touch|mv|cp|scp|rsync|rm|tee|docker\s+(?:pull|login|logout)|docker\s+compose\s+(?:up|down|restart)|systemctl\s+(?:start|stop|restart|reload)|sudo)\b/

  if (remoteWritePattern.test(preflightScript)) {
    failures.push(
      'scripts/deploy/read-only-preflight.sh: read-only preflight contains a write-capable command',
    )
  }

  if (
    !productionCompose.includes(
      'image: ${IMAGE_REF:?set immutable IMAGE_REF with @sha256 digest}',
    )
  ) {
    failures.push(
      'deploy/compose.production.yaml: image must be supplied as an immutable digest',
    )
  }

  if (productionCompose.includes('build:')) {
    failures.push(
      'deploy/compose.production.yaml: production compose must not build on the server',
    )
  }

  if (manifest.activationEnabled) {
    try {
      execFileSync(
        process.execPath,
        ['scripts/deploy/validate-runtime-manifest.mjs', '--mode', 'deploy'],
        { stdio: 'pipe' },
      )
    } catch (error) {
      failures.push(
        `deploy/runtime-paths.production.json: activation is enabled but deploy validation fails: ${
          error.stderr?.toString() || error.message
        }`,
      )
    }
  }

  for (const marker of [
    'sigstore/cosign-installer@6f9f17788090df1f26f669e9d70d6ae9567deba6',
    'cosign sign --yes',
    'cosign verify',
    'provenance: mode=max',
    'sbom: true',
    'cosign-verification.json',
  ]) {
    if (!releaseWorkflow.includes(marker)) {
      failures.push(
        `.github/workflows/release-image.yml: missing signed-release marker: ${marker}`,
      )
    }
  }

  if (!releaseWorkflow.includes('sha256:')) {
    failures.push(
      '.github/workflows/release-image.yml: release path does not enforce a sha256 image digest',
    )
  }

  for (const marker of [
    'PREFLIGHT_READINESS=PASS',
    'PREFLIGHT_READINESS=FAIL',
    'PREFLIGHT_STRICTNESS=',
    'exit 10',
    'ROLLBACK_IMAGE_NOT_CACHED',
  ]) {
    if (!preflightScript.includes(marker)) {
      failures.push(
        `scripts/deploy/read-only-preflight.sh: missing strict readiness marker: ${marker}`,
      )
    }
  }

  for (const marker of ['ps_rc=$?', 'running_rc=$?', 'expected_rc=$?', 'rollback 8']) {
    if (!activationScript.includes(marker)) {
      failures.push(
        `scripts/deploy/activate-release.sh: missing rollback routing marker: ${marker}`,
      )
    }
  }

  for (const marker of [
    'ROLLBACK_CONTAINMENT=',
    'down --remove-orphans',
    'stop "$service_name"',
    'ROLLBACK_STATUS=FAILED',
    'PREVIOUS_IMAGE_INSPECTION_FAILED',
  ]) {
    if (!rollbackScript.includes(marker)) {
      failures.push(
        `scripts/deploy/rollback-release.sh: missing containment marker: ${marker}`,
      )
    }
  }

  if (rollbackScript.includes('up -d --no-build --pull never --wait || true')) {
    failures.push(
      'scripts/deploy/rollback-release.sh: rollback restore failures must not be ignored',
    )
  }

  if (!preflightWorkflow.includes('READ_ONLY_PREFLIGHT')) {
    failures.push(
      '.github/workflows/runtime-preflight.yml: explicit read-only confirmation is missing',
    )
  }

  for (const marker of [
    'evidence',
    'PREFLIGHT_STRICTNESS=EVIDENCE',
    '^PREFLIGHT_READINESS=(PASS|FAIL)$',
  ]) {
    if (!preflightWorkflow.includes(marker)) {
      failures.push(
        `.github/workflows/runtime-preflight.yml: missing evidence-mode marker: ${marker}`,
      )
    }
  }
}

try {
  execFileSync(
    process.execPath,
    ['scripts/deploy/validate-runtime-manifest.mjs', '--mode', 'scaffold'],
    { stdio: 'pipe' },
  )
} catch (error) {
  failures.push(
    `runtime manifest scaffold validation failed: ${
      error.stderr?.toString() || error.message
    }`,
  )
}

if (failures.length > 0) {
  console.error('\nDeployment scaffold policy failed:\n')
  for (const failure of failures) {
    console.error(`- ${failure}`)
  }
  process.exit(1)
}

console.log('Deployment scaffold policy passed.')
