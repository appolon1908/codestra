import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const args = process.argv.slice(2)
const option = (name, fallback = '') => {
  const index = args.indexOf(name)
  return index === -1 ? fallback : args[index + 1]
}

const file = option('--file', 'deploy/runtime-paths.production.json')
const mode = option('--mode', 'scaffold')

if (!['scaffold', 'deploy'].includes(mode)) {
  console.error(`Unsupported mode: ${mode}`)
  process.exit(2)
}

let manifest
try {
  manifest = JSON.parse(readFileSync(resolve(file), 'utf8'))
} catch (error) {
  console.error(`Unable to read runtime manifest ${file}: ${error.message}`)
  process.exit(1)
}

const failures = []
const safeName = /^[a-zA-Z0-9][a-zA-Z0-9_.-]*$/
const safePath = /^\/[a-zA-Z0-9._/-]+$/
const safeHealthPath = /^\/[a-zA-Z0-9._~!$&()*+,;=:@%/-]*$/
const sha256 = /^[a-f0-9]{64}$/
const expectedHost = '49.12.145.107'
const allowedReleaseRoot =
  /^\/(?:srv|opt|data|mnt\/[a-zA-Z0-9._-]+|var\/(?:lib|www)|home\/[a-zA-Z0-9._-]+)\/[a-zA-Z0-9._/-]+$/
const forbiddenExactPaths = new Set([
  '/', '/bin', '/boot', '/dev', '/etc', '/home', '/lib', '/lib64',
  '/opt', '/proc', '/root', '/run', '/sbin', '/sys', '/tmp', '/usr', '/var',
])

const requireValue = (condition, message) => {
  if (!condition) failures.push(message)
}

const validateAbsolutePath = (name, value, { allowEmpty }) => {
  if (!value && allowEmpty) return

  requireValue(
    typeof value === 'string' && safePath.test(value),
    `${name} must be a normalized absolute path`,
  )
  requireValue(
    !String(value).includes('//')
      && !String(value).includes('/../')
      && !String(value).includes('/./')
      && !String(value).endsWith('/..')
      && !String(value).endsWith('/.'),
    `${name} must not contain traversal or duplicate separators`,
  )
  requireValue(!String(value).endsWith('/'), `${name} must not end with a slash`)
  requireValue(!forbiddenExactPaths.has(value), `${name} is too broad or unsafe`)
}

requireValue(manifest.schemaVersion === 1, 'schemaVersion must equal 1')
requireValue(manifest.environment === 'production', 'environment must equal production')
requireValue(manifest.expectedHost === expectedHost, `expectedHost must remain ${expectedHost}`)
requireValue(
  Array.isArray(manifest.expectedDnsNames)
    && manifest.expectedDnsNames.includes('codestra.co')
    && manifest.expectedDnsNames.includes('www.codestra.co'),
  'expectedDnsNames must include codestra.co and www.codestra.co',
)
requireValue(safeName.test(manifest.composeProject ?? ''), 'composeProject contains unsafe characters')
requireValue(safeName.test(manifest.serviceName ?? ''), 'serviceName contains unsafe characters')
requireValue(manifest.loopbackAddress === '127.0.0.1', 'loopbackAddress must remain 127.0.0.1')
requireValue(
  typeof manifest.healthPath === 'string' && safeHealthPath.test(manifest.healthPath),
  'healthPath is invalid',
)

const allowEmptyPaths = mode === 'scaffold'
validateAbsolutePath('releaseRoot', manifest.releaseRoot, { allowEmpty: allowEmptyPaths })
validateAbsolutePath('releasesDir', manifest.releasesDir, { allowEmpty: allowEmptyPaths })
validateAbsolutePath('currentSymlink', manifest.currentSymlink, { allowEmpty: allowEmptyPaths })

if (manifest.releaseRoot) {
  requireValue(
    allowedReleaseRoot.test(manifest.releaseRoot),
    'releaseRoot must use a dedicated application/data location',
  )
}

if (manifest.releaseRoot && manifest.releasesDir) {
  requireValue(
    manifest.releasesDir.startsWith(`${manifest.releaseRoot}/`),
    'releasesDir must be located below releaseRoot',
  )
}

if (manifest.releaseRoot && manifest.currentSymlink) {
  requireValue(
    manifest.currentSymlink.startsWith(`${manifest.releaseRoot}/`),
    'currentSymlink must be located below releaseRoot',
  )
}

if (manifest.releasesDir && manifest.currentSymlink) {
  requireValue(
    manifest.currentSymlink !== manifest.releasesDir
      && !manifest.currentSymlink.startsWith(`${manifest.releasesDir}/`),
    'currentSymlink must not be located inside releasesDir',
  )
}

for (const flag of [
  'runtimePathsVerified',
  'hostKeyVerified',
  'reverseProxyVerified',
  'loopbackBindingVerified',
  'rollbackVerified',
  'activationEnabled',
]) {
  requireValue(typeof manifest[flag] === 'boolean', `${flag} must be a boolean`)
}

if (mode === 'deploy') {
  for (const flag of [
    'runtimePathsVerified',
    'hostKeyVerified',
    'reverseProxyVerified',
    'loopbackBindingVerified',
    'rollbackVerified',
    'activationEnabled',
  ]) {
    requireValue(manifest[flag] === true, `${flag} must be true before activation`)
  }

  requireValue(
    Number.isInteger(manifest.loopbackPort)
      && manifest.loopbackPort >= 1024
      && manifest.loopbackPort <= 65535,
    'loopbackPort must be an unprivileged TCP port',
  )
  requireValue(['caddy', 'nginx'].includes(manifest.reverseProxy), 'reverseProxy must be caddy or nginx')
  requireValue(
    typeof manifest.verifiedBy === 'string' && safeName.test(manifest.verifiedBy),
    'verifiedBy must identify the approving operator',
  )
  requireValue(
    typeof manifest.evidenceSha256 === 'string' && sha256.test(manifest.evidenceSha256),
    'evidenceSha256 must be a lowercase SHA-256 digest',
  )

  const verifiedAt = Date.parse(manifest.verifiedAt)
  requireValue(Number.isFinite(verifiedAt), 'verifiedAt must be an ISO-8601 timestamp')
  requireValue(
    !Number.isFinite(verifiedAt) || verifiedAt <= Date.now() + 60_000,
    'verifiedAt must not be in the future',
  )
  requireValue(
    !Number.isFinite(verifiedAt) || Date.now() - verifiedAt <= 30 * 24 * 60 * 60 * 1000,
    'runtime evidence must be no more than 30 days old',
  )
}

if (failures.length > 0) {
  console.error(`Runtime manifest validation failed in ${mode} mode:`)
  for (const failure of failures) {
    console.error(`- ${failure}`)
  }
  process.exit(1)
}

console.log(`Runtime manifest ${file} passed ${mode} validation.`)
