import { readFileSync } from 'node:fs'

const scriptPath = 'scripts/deploy/read-only-runtime-discovery.sh'
const workflowPath = '.github/workflows/runtime-discovery.yml'
const script = readFileSync(scriptPath, 'utf8')
const workflow = readFileSync(workflowPath, 'utf8')
const failures = []

const requireText = (source, marker, location) => {
  if (!source.includes(marker)) {
    failures.push(`${location}: missing required marker: ${marker}`)
  }
}

for (const marker of [
  'DISCOVERY_MODE=READ_ONLY',
  'PREFLIGHT_REMOTE_WRITE_COUNT=0',
  'DISCOVERY_STATUS=PASS',
  'docker version',
  'docker compose version',
  'docker ps -a',
  'docker inspect',
  'com.docker.compose.project.working_dir',
  'com.docker.compose.project.config_files',
  'FRONTEND_PROXY_SHARED_NETWORKS',
  'CADDY_CONFIG_SOURCE',
  'PUBLIC_PROBE=',
]) {
  requireText(script, marker, scriptPath)
}

const forbiddenRemotePatterns = [
  [/\bsudo\b/, 'sudo'],
  [/\bsystemctl\b/, 'systemctl'],
  [/\b(?:mkdir|install|touch|mv|cp|scp|rsync|rm|tee)\b/, 'filesystem write command'],
  [/\bdocker\s+(?:pull|login|logout|restart|start|stop|kill|rm|rmi|network\s+(?:create|rm)|volume\s+(?:create|rm))\b/, 'state-changing docker command'],
  [/\bdocker\s+compose\s+(?:up|down|start|stop|restart|pull|build|create|rm)\b/, 'state-changing docker compose command'],
  [/\bcaddy\s+(?:reload|start|stop)\b/, 'state-changing caddy command'],
]

for (const [pattern, label] of forbiddenRemotePatterns) {
  if (pattern.test(script)) {
    failures.push(`${scriptPath}: contains forbidden ${label}`)
  }
}

for (const marker of [
  'branches:\n      - main',
  'environment: production',
  'DEPLOY_HOST does not match the verified public site host.',
  'StrictHostKeyChecking=yes',
  'PasswordAuthentication=no',
  'KbdInteractiveAuthentication=no',
  'ForwardAgent=no',
  'ClearAllForwardings=yes',
  'RequestTTY=no',
  "'bash -s'",
  '< scripts/deploy/read-only-runtime-discovery.sh',
  "grep -Fx 'PREFLIGHT_REMOTE_WRITE_COUNT=0'",
  'sha256sum runtime-discovery.txt',
  'if: always()',
]) {
  requireText(workflow, marker, workflowPath)
}

for (const forbidden of [
  'pull_request_target:',
  'StrictHostKeyChecking=no',
  'PasswordAuthentication=yes',
  'KbdInteractiveAuthentication=yes',
  'ForwardAgent=yes',
  'scp ',
  'rsync ',
  'sudo ',
  'docker compose up',
  'docker compose down',
  'docker pull',
  'systemctl restart',
  'systemctl reload',
]) {
  if (workflow.includes(forbidden)) {
    failures.push(`${workflowPath}: contains forbidden marker: ${forbidden}`)
  }
}

if (failures.length > 0) {
  console.error('\nRuntime discovery policy failed:\n')
  for (const failure of failures) {
    console.error(`- ${failure}`)
  }
  process.exit(1)
}

console.log('Runtime discovery policy passed.')
