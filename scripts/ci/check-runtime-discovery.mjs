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
  '--test-config-root',
  'TEST_CONFIG_ROOT_REQUIRES_CI',
  'DISCOVERY_MODE=READ_ONLY',
  'PREFLIGHT_REMOTE_WRITE_COUNT=0',
  'DISCOVERY_STATUS=PASS',
  'docker version',
  'docker compose version',
  'docker ps -a',
  'docker inspect',
  'com.docker.compose.project.working_dir',
  'com.docker.compose.project.config_files',
  'state="$(sed -n',
  'CANDIDATE_SKIPPED_NOT_RUNNING=',
  '"$project" == "codestra-prod" && "$service" == "frontend"',
  '"$project" == "codestra-prod" && "$service" == "web"',
  '"$project" == "codestra" && "$service" == "web"',
  '"$project" == "codestra" && "$service" == "frontend"',
  '"$project" == "codestra-prod" && ( "$service" == "caddy" || "$service" == "nginx" )',
  '"$project" == "codestra" && ( "$service" == "caddy" || "$service" == "nginx" )',
  'FRONTEND_BINDING=',
  'FRONTEND_LOOPBACK_PORTS=',
  'PROXY_KIND=CONTAINER',
  'PROXY_KIND=HOST',
  'pgrep -x caddy',
  'pgrep -x nginx',
  'extract_caddy_routes',
  'extract_nginx_routes',
  'server_names[name_index] == "codestra.co"',
  'server_names[name_index] == "www.codestra.co"',
  'nginx_candidate_routes="$(extract_nginx_routes "$nginx_candidate")"',
  'FRONTEND_PROXY_LINK=HOST_LOOPBACK',
  'HOST_PROXY_LOOPBACK_ROUTE=PASS',
  'mark_fatal HOST_PROXY_LOOPBACK_BINDING_NOT_IDENTIFIED',
  'mark_fatal HOST_PROXY_LOOPBACK_ROUTE_NOT_VERIFIED',
  'FRONTEND_PROXY_PROJECT_MISMATCH=',
  'mark_fatal FRONTEND_PROXY_PROJECT_MISMATCH',
  'FRONTEND_PROXY_SHARED_NETWORKS',
  'mark_fatal FRONTEND_CONTAINER_NOT_IDENTIFIED',
  'mark_fatal SHARED_DOCKER_NETWORK_NOT_IDENTIFIED',
  'PROXY_ROUTE_CONFIG_SOURCE=',
  'mark_fatal PROXY_NOT_IDENTIFIED',
  'mark_fatal PROXY_ROUTE_NOT_IDENTIFIED',
  'CADDY_ROUTE_SCOPE=SITE_DECLARATIONS_REVERSE_PROXY_REDIRECT_ONLY',
  'NGINX_ROUTE_SCOPE=SERVER_NAME_PROXY_PASS_ONLY',
  'syntax = $0',
  'sub(/^[[:space:]]*#.*/, "", syntax)',
  'sub(/[[:space:]]+#.*$/, "", syntax)',
  'sanitize_effective_origin',
  'mapfile -t probe_fields',
  'PUBLIC_PROBE_REQUEST=',
  'EFFECTIVE_ORIGIN=',
  '2>/dev/null',
  'safe_line',
  "s#(https?://)[^/@[:space:]]+@#\\1REDACTED@#Ig",
]) {
  requireText(script, marker, scriptPath)
}

const runningStateGuards = script.match(/&& "\$state" == "running"/g) ?? []
if (runningStateGuards.length < 6) {
  failures.push(
    `${scriptPath}: every frontend and proxy candidate must require state=running; found ${runningStateGuards.length} guard(s)`,
  )
}

const forbiddenRemotePatterns = [
  [/\bsudo\b/, 'sudo'],
  [/\bsystemctl\b/, 'systemctl'],
  [/\b(?:mkdir|install|touch|mv|cp|scp|rsync|rm|tee)\b/, 'filesystem write command'],
  [/\bdocker\s+(?:pull|login|logout|restart|start|stop|kill|rm|rmi|network\s+(?:create|rm)|volume\s+(?:create|rm))\b/, 'state-changing docker command'],
  [/\bdocker\s+compose\s+(?:up|down|start|stop|restart|pull|build|create|rm)\b/, 'state-changing docker compose command'],
  [/\bcaddy\s+(?:reload|start|stop)\b/, 'state-changing caddy command'],
  [/\bnginx\s+-s\b/, 'state-changing nginx command'],
]

for (const [pattern, label] of forbiddenRemotePatterns) {
  if (pattern.test(script)) {
    failures.push(`${scriptPath}: contains forbidden ${label}`)
  }
}

for (const forbidden of [
  '-B 4 -A 24',
  'basicauth',
  'basic_auth',
  '.Config.Env',
  'docker inspect --format {{json .Config}}',
  '"$container" == codestra-prod-frontend-*',
  '"$container" == codestra-web-*',
  '"$container" == codestra-prod-caddy-*',
  '"$container" == codestra-caddy-*',
  'RESULT=$result',
  'PUBLIC_PROBE=$url',
  '--show-error',
  'CODESTRA_DISCOVERY_CONFIG_ROOT',
  'server_name[[:space:]].*((www\\.)?codestra\\.co)',
]) {
  if (script.includes(forbidden)) {
    failures.push(`${scriptPath}: contains unsafe evidence marker: ${forbidden}`)
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
