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
# codestra.co { COMMENTED_SITE_SHOULD_NOT_APPEAR
codestra.co, www.codestra.co { # production site
    basic_auth {
        admin $2a$12$THIS_MUST_NEVER_APPEAR
    }
    header X-Literal "{"
    reverse_proxy HTTPS://operator:super-secret@frontend:8080
}

auth.codestra.co {
    reverse_proxy HTTPS://comment-user:comment-secret@keycloak:8080
}

after.example {
    reverse_proxy HTTPS://after-user:after-secret@after-backend:8080
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
set -Eeuo pipefail
proto=''
proto_redir=''
while [[ "$#" -gt 0 ]]; do
  case "$1" in
    --proto)
      proto="${2:-}"
      shift 2
      ;;
    --proto-redir)
      proto_redir="${2:-}"
      shift 2
      ;;
    *)
      shift
      ;;
  esac
done
[[ "$proto" == '=https' ]] || exit 91
[[ "$proto_redir" == '=https' ]] || exit 92
printf '200\n49.12.145.107\nFTPS://probe-user:probe-secret@codestra.co/private/?token=probe-token#probe-fragment'
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
    case "$mode" in
      future)
        printf '%s\n' \
          'codestra-web-stale' \
          'codestra-caddy-stale' \
          'codestra-caddy-1' \
          'codestra-web-1'
        ;;
      override)
        printf '%s\n' \
          'codestra-prod-web-stale' \
          'codestra-prod-caddy-stale' \
          'codestra-prod-caddy-1' \
          'codestra-prod-web-1'
        ;;
      stopped)
        printf '%s\n' \
          'codestra-prod-frontend-stopped' \
          'codestra-prod-caddy-stopped' \
          'codestra-caddy-1' \
          'codestra-web-1'
        ;;
      mixed)
        printf '%s\n' \
          'codestra-prod-frontend-1' \
          'codestra-caddy-1'
        ;;
      *)
        printf '%s\n' \
          'codestra-prod-frontend-stale' \
          'codestra-prod-caddy-stale' \
          'codestra-prod-caddy-1' \
          'codestra-prod-frontend-1'
        ;;
    esac
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
    state='running'
    health='healthy'
    networks=$'other_default\n'

    case "$container" in
      codestra-prod-frontend-1)
        project='codestra-prod'
        service='frontend'
        working_dir="$MOCK_ROOT/site"
        config_files="$MOCK_ROOT/site/compose.production.yaml"
        image='codestra-frontend:server-c-web-integration-20260816'
        image_id='sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'
        if [[ "$mode" == 'mixed' ]]; then
          networks=$'codestra-prod_default\nedge\n'
        else
          networks=$'codestra-prod_default\ncodestra-edge\n'
        fi
        ;;
      codestra-prod-web-1)
        project='codestra-prod'
        service='web'
        working_dir="$MOCK_ROOT/site"
        config_files="$MOCK_ROOT/site/compose.production.yaml"
        image='ghcr.io/appolon1908-hue/codestra@sha256:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
        image_id='sha256:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
        networks=$'codestra-prod_default\nedge\n'
        ;;
      codestra-prod-caddy-1)
        project='codestra-prod'
        service='caddy'
        working_dir="$MOCK_ROOT/site"
        config_files="$MOCK_ROOT/site/compose.production.yaml"
        image='caddy:2.10'
        image_id='sha256:cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc'
        if [[ "$mode" == 'override' ]]; then
          networks=$'edge\ncodestra-prod_default\n'
        else
          networks=$'codestra-edge\ncodestra-prod_default\n'
        fi
        ;;
      codestra-prod-frontend-stopped)
        project='codestra-prod'
        service='frontend'
        working_dir='/tmp/stopped-codestra-prod'
        config_files='/tmp/stopped-codestra-prod/compose.yaml'
        image='codestra-frontend:stopped'
        image_id='sha256:1111111111111111111111111111111111111111111111111111111111111111'
        state='exited'
        health='none'
        networks=$'codestra-prod_default\ncodestra-edge\n'
        ;;
      codestra-prod-caddy-stopped)
        project='codestra-prod'
        service='caddy'
        working_dir='/tmp/stopped-codestra-prod'
        config_files='/tmp/stopped-codestra-prod/compose.yaml'
        image='caddy:stopped'
        image_id='sha256:2222222222222222222222222222222222222222222222222222222222222222'
        state='exited'
        health='none'
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
      printf 'project=%s|service=%s|working_dir=%s|config_files=%s|image=%s|image_id=%s|state=%s|health=%s|restarts=0|ports={"8080/tcp":null}|networks=fixture\n' \
        "$project" "$service" "$working_dir" "$config_files" "$image" "$image_id" "$state" "$health"
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

assert_scoped_caddy_output() {
  local report="$1"
  grep -F 'CADDY_ROUTE_SCOPE=SITE_DECLARATIONS_REVERSE_PROXY_REDIRECT_ONLY' "$report"
  grep -F 'reverse_proxy HTTPS://REDACTED@frontend:8080' "$report"
  if grep -Eq 'COMMENTED_SITE_SHOULD_NOT_APPEAR|THIS_MUST_NEVER_APPEAR|super-secret|comment-secret|comment-user|after-secret|after-user|basic_auth|auth\.codestra\.co|keycloak:8080|after-backend:8080|header X-Literal' "$report"; then
    echo 'Fixture exposed excluded or sensitive Caddy evidence.' >&2
    cat "$report" >&2
    exit 1
  fi
}

assert_public_probe_redaction() {
  local report="$1"
  grep -Fx 'PUBLIC_PROBE_REQUEST=https://codestra.co/en/|RC=0|HTTP=200|REMOTE_IP=49.12.145.107|EFFECTIVE_ORIGIN=FTPS://REDACTED@codestra.co' "$report"
  grep -Fx 'PUBLIC_PROBE_REQUEST=https://www.codestra.co/en/|RC=0|HTTP=200|REMOTE_IP=49.12.145.107|EFFECTIVE_ORIGIN=FTPS://REDACTED@codestra.co' "$report"
  if grep -Eq 'probe-user|probe-secret|probe-token|probe-fragment|\?token=|#probe-' "$report"; then
    echo 'Fixture exposed sensitive public redirect evidence.' >&2
    cat "$report" >&2
    exit 1
  fi
}

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
  assert_scoped_caddy_output "$report"
  assert_public_probe_redaction "$report"
  grep -Fx 'DISCOVERY_FATAL_FAILURE_COUNT=0' "$report"
  grep -Fx 'DISCOVERY_STATUS=PASS' "$report"
  grep -Fx 'PREFLIGHT_REMOTE_WRITE_COUNT=0' "$report"

  if [[ "$mode" == 'stopped' ]]; then
    grep -F 'CANDIDATE_SKIPPED_NOT_RUNNING=codestra-prod-frontend-stopped|PROJECT=codestra-prod|SERVICE=frontend|STATE=exited' "$report"
    grep -F 'CANDIDATE_SKIPPED_NOT_RUNNING=codestra-prod-caddy-stopped|PROJECT=codestra-prod|SERVICE=caddy|STATE=exited' "$report"
  fi

  if grep -Eq 'FRONTEND_CONTAINER=.*(stale|stopped)|PROXY_CONTAINER=.*(stale|stopped)' "$report"; then
    echo "Fixture $mode selected an invalid container." >&2
    cat "$report" >&2
    exit 1
  fi
}

run_mixed_project_failure() {
  local report="$fixture_root/runtime-discovery-mixed.txt"
  set +e
  PATH="$mock_bin:$PATH" MOCK_ROOT="$fixture_root" MOCK_TOPOLOGY='mixed' \
    bash "$repository_root/scripts/deploy/read-only-runtime-discovery.sh" > "$report"
  local rc=$?
  set -e

  [[ "$rc" -eq 10 ]] || {
    echo "Mixed-project fixture returned unexpected code: $rc" >&2
    cat "$report" >&2
    exit 1
  }

  grep -Fx 'FRONTEND_PROJECT=codestra-prod' "$report"
  grep -Fx 'PROXY_PROJECT=codestra' "$report"
  grep -Fx 'FRONTEND_PROXY_PROJECT_MISMATCH=FRONTEND:codestra-prod|PROXY:codestra' "$report"
  grep -Fx 'DISCOVERY_FAILURE=FRONTEND_PROXY_PROJECT_MISMATCH' "$report"
  grep -Fx 'FRONTEND_PROXY_SHARED_NETWORKS=edge' "$report"
  assert_scoped_caddy_output "$report"
  assert_public_probe_redaction "$report"
  grep -Fx 'DISCOVERY_FATAL_FAILURE_COUNT=1' "$report"
  grep -Fx 'DISCOVERY_STATUS=FAIL' "$report"
  grep -Fx 'PREFLIGHT_REMOTE_WRITE_COUNT=0' "$report"
}

run_case \
  current \
  codestra-prod-frontend-1 \
  codestra-prod \
  frontend \
  codestra-prod-caddy-1 \
  codestra-prod_default,codestra-edge

run_case \
  override \
  codestra-prod-web-1 \
  codestra-prod \
  web \
  codestra-prod-caddy-1 \
  codestra-prod_default,edge

run_case \
  future \
  codestra-web-1 \
  codestra \
  web \
  codestra-caddy-1 \
  codestra_default,edge

run_case \
  stopped \
  codestra-web-1 \
  codestra \
  web \
  codestra-caddy-1 \
  codestra_default,edge

run_mixed_project_failure

printf 'Runtime discovery fixtures passed.\n'
