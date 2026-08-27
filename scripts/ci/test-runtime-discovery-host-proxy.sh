#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'
umask 077

repository_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
fixture_root="$(mktemp -d)"
trap 'rm -rf "$fixture_root"' EXIT

mock_bin="$fixture_root/bin"
site_root="$fixture_root/site"
config_root="$fixture_root/etc"
wrong_config_root="$fixture_root/etc-wrong"
mkdir -p \
  "$mock_bin" \
  "$site_root/releases/prior" \
  "$config_root/caddy" \
  "$config_root/nginx/sites-enabled" \
  "$wrong_config_root/caddy"
touch \
  "$site_root/compose.production.yaml" \
  "$site_root/releases/prior/compose.yaml" \
  "$site_root/releases/prior/.env"
ln -s "$site_root/releases/prior" "$site_root/current"

cat > "$config_root/caddy/Caddyfile" <<'CADDY'
# codestra.co { COMMENTED_HOST_CADDY_SITE
auth.codestra.co {
    reverse_proxy HTTPS://hidden-user:hidden-secret@keycloak:8080
}

codestra.co, www.codestra.co {
    reverse_proxy 127.0.0.1:5000
}
CADDY

cat > "$wrong_config_root/caddy/Caddyfile" <<'CADDY'
codestra.co, www.codestra.co {
    reverse_proxy 127.0.0.1:6000
}
CADDY

cat > "$config_root/nginx/sites-enabled/codestra.conf" <<'NGINX'
# server { COMMENTED_HOST_NGINX_SITE
server {
    server_name auth.codestra.co;
    location / {
        proxy_pass HTTPS://hidden-user:hidden-secret@keycloak:8080;
    }
}

server {
    server_name codestra.co www.codestra.co;
    location / {
        proxy_pass http://localhost:5000;
    }
}
NGINX

cat > "$mock_bin/hostname" <<'MOCK'
#!/usr/bin/env bash
if [[ "${1:-}" == "-I" ]]; then
  printf '49.12.145.107 10.40.0.3\n'
else
  printf 'codestra-server-c\n'
fi
MOCK

cat > "$mock_bin/ip" <<'MOCK'
#!/usr/bin/env bash
printf 'lo               UNKNOWN        127.0.0.1/8\n'
printf 'eth0             UP             49.12.145.107/32\n'
MOCK

cat > "$mock_bin/ss" <<'MOCK'
#!/usr/bin/env bash
printf 'LISTEN 0 4096 127.0.0.1:5000 0.0.0.0:*\n'
printf 'LISTEN 0 4096 0.0.0.0:80 0.0.0.0:*\n'
printf 'LISTEN 0 4096 0.0.0.0:443 0.0.0.0:*\n'
MOCK

cat > "$mock_bin/curl" <<'MOCK'
#!/usr/bin/env bash
printf '200\n49.12.145.107\nHTTPS://probe-user:probe-secret@codestra.co/en/?token=probe-token#probe-fragment'
MOCK

cat > "$mock_bin/pgrep" <<'MOCK'
#!/usr/bin/env bash
mode="${HOST_PROXY_MODE:-missing}"
process="${2:-}"
case "$mode:$process" in
  caddy:caddy|wrong:caddy)
    exit 0
    ;;
  nginx:nginx)
    exit 0
    ;;
  *)
    exit 1
    ;;
esac
MOCK

cat > "$mock_bin/docker" <<'MOCK'
#!/usr/bin/env bash
set -Eeuo pipefail
command_name="${1:-}"
shift || true

case "$command_name" in
  version)
    printf '27.5.1\n'
    ;;
  compose)
    [[ "${1:-}" == "version" ]] || exit 64
    printf '2.32.4\n'
    ;;
  ps)
    printf 'codestra-web-1\n'
    ;;
  inspect)
    container="${1:?container required}"
    shift
    [[ "$container" == 'codestra-web-1' ]] || exit 64
    [[ "${1:-}" == "--format" ]] || exit 64
    format="${2:-}"

    if [[ "$format" == *'project={{index .Config.Labels'* ]]; then
      printf 'project=codestra|service=web|working_dir=%s/site|config_files=%s/site/compose.production.yaml|image=ghcr.io/appolon1908-hue/codestra@sha256:dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd|image_id=sha256:dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd|state=running|health=healthy|restarts=0|ports={"8080/tcp":[{"HostIp":"127.0.0.1","HostPort":"5000"}]}|networks=codestra_default,\n' \
        "$MOCK_ROOT" "$MOCK_ROOT"
    elif [[ "$format" == *'FRONTEND_BINDING='* ]]; then
      printf 'FRONTEND_BINDING=CONTAINER_PORT=8080/tcp|HOST_IP=127.0.0.1|HOST_PORT=5000\n'
    elif [[ "$format" == *'FRONTEND_NETWORK='* ]]; then
      printf 'FRONTEND_NETWORK=codestra_default|ALIASES=["web"]|IP=172.31.0.10\n'
    elif [[ "$format" == *'{{$name}}{{println}}'* ]]; then
      printf 'codestra_default\n'
    elif [[ "$format" == *'com.docker.compose.service'* ]]; then
      printf 'web\n'
    else
      exit 65
    fi
    ;;
  *)
    exit 64
    ;;
esac
MOCK

chmod 0755 \
  "$mock_bin/hostname" \
  "$mock_bin/ip" \
  "$mock_bin/ss" \
  "$mock_bin/curl" \
  "$mock_bin/pgrep" \
  "$mock_bin/docker"

assert_common_success() {
  local report="$1"
  local proxy_service="$2"
  grep -Fx 'DISCOVERY_MODE=READ_ONLY' "$report"
  grep -Fx 'FRONTEND_CONTAINER=codestra-web-1' "$report"
  grep -Fx 'FRONTEND_PROJECT=codestra' "$report"
  grep -Fx 'FRONTEND_SERVICE=web' "$report"
  grep -Fx 'FRONTEND_LOOPBACK_PORTS=5000' "$report"
  grep -Fx 'PROXY_KIND=HOST' "$report"
  grep -Fx 'PROXY_PROJECT=HOST' "$report"
  grep -Fx "PROXY_SERVICE=$proxy_service" "$report"
  grep -Fx 'FRONTEND_PROXY_LINK=HOST_LOOPBACK' "$report"
  grep -Fx 'HOST_PROXY_LOOPBACK_ROUTE=PASS|PORT=5000' "$report"
  grep -Fx 'PUBLIC_PROBE_REQUEST=https://codestra.co/en/|RC=0|HTTP=200|REMOTE_IP=49.12.145.107|EFFECTIVE_ORIGIN=HTTPS://REDACTED@codestra.co' "$report"
  grep -Fx 'DISCOVERY_FATAL_FAILURE_COUNT=0' "$report"
  grep -Fx 'DISCOVERY_STATUS=PASS' "$report"
  grep -Fx 'PREFLIGHT_REMOTE_WRITE_COUNT=0' "$report"

  if grep -Eq 'hidden-user|hidden-secret|probe-user|probe-secret|probe-token|probe-fragment|COMMENTED_HOST_|auth\.codestra\.co|keycloak:8080' "$report"; then
    echo 'Host proxy fixture exposed excluded or sensitive evidence.' >&2
    cat "$report" >&2
    exit 1
  fi
}

run_caddy_success() {
  local report="$fixture_root/host-caddy.txt"
  CI=true HOST_PROXY_MODE=caddy MOCK_ROOT="$fixture_root" PATH="$mock_bin:$PATH" \
    bash "$repository_root/scripts/deploy/read-only-runtime-discovery.sh" \
      --test-config-root "$config_root" > "$report"
  grep -Fx 'CADDY_ROUTE_SCOPE=SITE_DECLARATIONS_REVERSE_PROXY_REDIRECT_ONLY' "$report"
  grep -F 'CADDY_ROUTE=' "$report" | grep -F 'reverse_proxy 127.0.0.1:5000'
  assert_common_success "$report" caddy
}

run_nginx_success() {
  local report="$fixture_root/host-nginx.txt"
  CI=true HOST_PROXY_MODE=nginx MOCK_ROOT="$fixture_root" PATH="$mock_bin:$PATH" \
    bash "$repository_root/scripts/deploy/read-only-runtime-discovery.sh" \
      --test-config-root "$config_root" > "$report"
  grep -Fx 'NGINX_ROUTE_SCOPE=SERVER_NAME_PROXY_PASS_ONLY' "$report"
  grep -F 'NGINX_ROUTE=' "$report" | grep -F 'server_name codestra.co www.codestra.co;'
  grep -F 'NGINX_ROUTE=' "$report" | grep -F 'proxy_pass http://localhost:5000;'
  assert_common_success "$report" nginx
}

run_wrong_route_failure() {
  local report="$fixture_root/host-wrong-route.txt"
  set +e
  CI=true HOST_PROXY_MODE=wrong MOCK_ROOT="$fixture_root" PATH="$mock_bin:$PATH" \
    bash "$repository_root/scripts/deploy/read-only-runtime-discovery.sh" \
      --test-config-root "$wrong_config_root" > "$report"
  local rc=$?
  set -e

  [[ "$rc" -eq 10 ]] || {
    echo "Wrong-route fixture returned unexpected code: $rc" >&2
    cat "$report" >&2
    exit 1
  }
  grep -Fx 'PROXY_KIND=HOST' "$report"
  grep -Fx 'FRONTEND_LOOPBACK_PORTS=5000' "$report"
  grep -Fx 'HOST_PROXY_LOOPBACK_ROUTE=FAIL' "$report"
  grep -Fx 'DISCOVERY_FAILURE=HOST_PROXY_LOOPBACK_ROUTE_NOT_VERIFIED' "$report"
  grep -Fx 'DISCOVERY_STATUS=FAIL' "$report"
  grep -Fx 'PREFLIGHT_REMOTE_WRITE_COUNT=0' "$report"
}

run_missing_proxy_failure() {
  local report="$fixture_root/host-missing.txt"
  set +e
  CI=true HOST_PROXY_MODE=missing MOCK_ROOT="$fixture_root" PATH="$mock_bin:$PATH" \
    bash "$repository_root/scripts/deploy/read-only-runtime-discovery.sh" \
      --test-config-root "$config_root" > "$report"
  local rc=$?
  set -e

  [[ "$rc" -eq 10 ]] || {
    echo "Missing-proxy fixture returned unexpected code: $rc" >&2
    cat "$report" >&2
    exit 1
  }
  grep -Fx 'PROXY_KIND=NOT_IDENTIFIED' "$report"
  grep -Fx 'DISCOVERY_FAILURE=PROXY_NOT_IDENTIFIED' "$report"
  grep -Fx 'DISCOVERY_STATUS=FAIL' "$report"
  grep -Fx 'PREFLIGHT_REMOTE_WRITE_COUNT=0' "$report"
}

run_caddy_success
run_nginx_success
run_wrong_route_failure
run_missing_proxy_failure

printf 'Host reverse-proxy discovery fixtures passed.\n'
