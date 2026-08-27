#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'
umask 077

repository_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
fixture_root="$(mktemp -d)"
trap 'rm -rf "$fixture_root"' EXIT

mock_bin="$fixture_root/bin"
site_root="$fixture_root/site"
releases_dir="$site_root/releases"
prior_release="$releases_dir/prior"
mkdir -p "$mock_bin" "$prior_release"
touch "$site_root/compose.production.yaml" "$prior_release/compose.yaml" "$prior_release/.env"
ln -s "$prior_release" "$site_root/current"

cat > "$site_root/Caddyfile" <<'CADDY'
codestra.co, www.codestra.co {
    basic_auth {
        admin $2a$12$THIS_MUST_NEVER_APPEAR
    }
    reverse_proxy HTTPS://operator:super-secret@frontend:8080
}

auth.codestra.co {
    reverse_proxy keycloak:8080
}
CADDY

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
printf 'LISTEN 0 4096 0.0.0.0:80 0.0.0.0:*\n'
printf 'LISTEN 0 4096 0.0.0.0:443 0.0.0.0:*\n'
MOCK

cat > "$mock_bin/curl" <<'MOCK'
#!/usr/bin/env bash
url="${!#}"
printf '200|49.12.145.107|%s' "$url"
MOCK

cat > "$mock_bin/docker" <<'MOCK'
#!/usr/bin/env bash
set -Eeuo pipefail

mode="${MOCK_TOPOLOGY:-current}"
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
    if [[ "$mode" == "future" ]]; then
      printf '%s\n' \
        'unrelated-frontend-1' \
        'codestra-caddy-1' \
        'codestra-web-1'
    else
      printf '%s\n' \
        'unrelated-frontend-1' \
        'codestra-prod-caddy-1' \
        'codestra-prod-frontend-1'
    fi
    ;;
  inspect)
    container="${1:?container required}"
    shift
    [[ "${1:-}" == "--format" ]] || exit 64
    format="${2:-}"

    project='other-project'
    service='frontend'
    working_dir='/tmp/unrelated'
    config_files='/tmp/unrelated/compose.yaml'
    image='unrelated:latest'
    image_id='sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
    networks=$'other_default\n'

    case "$container" in
      codestra-prod-frontend-1)
        project='codestra-prod'
        service='frontend'
        working_dir="$MOCK_ROOT/site"
        config_files="$MOCK_ROOT/site/compose.production.yaml"
        image='codestra-frontend:server-c-web-integration-20260816'
        image_id='sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'
        networks=$'codestra-prod_default\ncodestra-edge\n'
        ;;
      codestra-prod-caddy-1)
        project='codestra-prod'
        service='caddy'
        working_dir="$MOCK_ROOT/site"
        config_files="$MOCK_ROOT/site/compose.production.yaml"
        image='caddy:2.10'
        image_id='sha256:cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc'
        networks=$'codestra-edge\ncodestra-prod_default\n'
        ;;
      codestra-web-1)
        project='codestra'
        service='web'
        working_dir="$MOCK_ROOT/site"
        config_files="$MOCK_ROOT/site/compose.production.yaml"
        image='ghcr.io/appolon1908-hue/codestra@sha256:dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd'
        image_id='sha256:dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd'
        networks=$'codestra_default\nedge\n'
        ;;
      codestra-caddy-1)
        project='codestra'
        service='caddy'
        working_dir="$MOCK_ROOT/site"
        config_files="$MOCK_ROOT/site/compose.production.yaml"
        image='caddy:2.10'
        image_id='sha256:eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
        networks=$'edge\ncodestra_default\n'
        ;;
    esac

    if [[ "$format" == *'project={{index .Config.Labels'* ]]; then
      printf 'project=%s|service=%s|working_dir=%s|config_files=%s|image=%s|image_id=%s|state=running|health=healthy|restarts=0|ports={"8080/tcp":null}|networks=fixture\n' \
        "$project" "$service" "$working_dir" "$config_files" "$image" "$image_id"
    elif [[ "$format" == *'FRONTEND_NETWORK='* || "$format" == *'PROXY_NETWORK='* ]]; then
      while IFS= read -r network; do
        [[ -n "$network" ]] || continue
        if [[ "$service" == 'frontend' || "$service" == 'web' ]]; then
          printf 'FRONTEND_NETWORK=%s|ALIASES=["frontend"]|IP=172.30.0.10\n' "$network"
        else
          printf 'PROXY_NETWORK=%s|ALIASES=["caddy"]|IP=172.30.0.2\n' "$network"
        fi
      done <<< "$networks"
    elif [[ "$format" == *'{{$name}}{{println}}'* ]]; then
      printf '%s' "$networks"
    elif [[ "$format" == *'com.docker.compose.service'* ]]; then
      printf '%s\n' "$service"
    elif [[ "$format" == *'/etc/caddy/Caddyfile'* ]]; then
      if [[ "$service" == 'caddy' ]]; then
        printf '%s/site/Caddyfile\n' "$MOCK_ROOT"
      fi
    else
      exit 65
    fi
    ;;
  *)
    exit 64
    ;;
esac
MOCK

chmod 0755 "$mock_bin/hostname" "$mock_bin/ip" "$mock_bin/ss" "$mock_bin/curl" "$mock_bin/docker"

run_case() {
  local mode="$1"
  local expected_frontend="$2"
  local expected_project="$3"
  local expected_service="$4"
  local expected_proxy="$5"
  local expected_networks="$6"
  local report="$fixture_root/runtime-discovery-${mode}.txt"

  PATH="$mock_bin:$PATH" MOCK_ROOT="$fixture_root" MOCK_TOPOLOGY="$mode" \
    bash "$repository_root/scripts/deploy/read-only-runtime-discovery.sh" > "$report"

  grep -Fx 'DISCOVERY_MODE=READ_ONLY' "$report"
  grep -Fx "FRONTEND_CONTAINER=$expected_frontend" "$report"
  grep -Fx "FRONTEND_PROJECT=$expected_project" "$report"
  grep -Fx "FRONTEND_SERVICE=$expected_service" "$report"
  grep -Fx "PROXY_CONTAINER=$expected_proxy" "$report"
  grep -Fx "PROXY_PROJECT=$expected_project" "$report"
  grep -Fx "FRONTEND_PROXY_SHARED_NETWORKS=$expected_networks" "$report"
  grep -F 'CADDY_ROUTE_SCOPE=SITE_DECLARATIONS_REVERSE_PROXY_REDIRECT_ONLY' "$report"
  grep -F 'reverse_proxy HTTPS://REDACTED@frontend:8080' "$report"
  grep -Fx 'DISCOVERY_FATAL_FAILURE_COUNT=0' "$report"
  grep -Fx 'DISCOVERY_STATUS=PASS' "$report"
  grep -Fx 'PREFLIGHT_REMOTE_WRITE_COUNT=0' "$report"

  if grep -Eq 'THIS_MUST_NEVER_APPEAR|super-secret|basic_auth|auth\.codestra\.co|keycloak:8080|unrelated-frontend-1\|project=' "$report"; then
    echo "Fixture $mode exposed excluded or sensitive evidence." >&2
    cat "$report" >&2
    exit 1
  fi
}

run_case \
  current \
  codestra-prod-frontend-1 \
  codestra-prod \
  frontend \
  codestra-prod-caddy-1 \
  codestra-prod_default,codestra-edge

run_case \
  future \
  codestra-web-1 \
  codestra \
  web \
  codestra-caddy-1 \
  codestra_default,edge

printf 'Runtime discovery fixtures passed.\n'
