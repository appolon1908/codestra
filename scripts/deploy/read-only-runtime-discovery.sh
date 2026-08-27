#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'
umask 077

config_root="/etc"
if [[ "${1:-}" == "--test-config-root" ]]; then
  [[ "${CI:-}" == "true" ]] || {
    echo "ERROR=TEST_CONFIG_ROOT_REQUIRES_CI"
    exit 2
  }
  config_root="${2:?test config root is required}"
  [[ "$config_root" == /tmp/* && "$config_root" != *".."* && "$config_root" != *"//"* ]] || {
    echo "ERROR=UNSAFE_TEST_CONFIG_ROOT"
    exit 2
  }
  shift 2
fi
[[ "$#" -eq 0 ]] || {
  echo "ERROR=UNEXPECTED_ARGUMENTS"
  exit 2
}

fatal_failures=0
mark_fatal() {
  fatal_failures=$((fatal_failures + 1))
  echo "DISCOVERY_FAILURE=$1"
}

safe_line() {
  sed -E \
    -e 's/((authorization|password|passwd|secret|token|api[_-]?key|credential)[^[:space:]]*)[[:space:]]+[^[:space:]]+/\1 REDACTED/Ig' \
    -e 's#(https?://)[^/@[:space:]]+@#\1REDACTED@#Ig' \
    -e 's#([^|[:space:]]*(secret|token|password|credential|private)[^|[:space:]]*)#REDACTED_PATH#Ig'
}

sanitize_effective_origin() {
  sed -E \
    -e 's#(https?://)[^/@[:space:]]+@#\1REDACTED@#Ig' \
    -e 's/[?#].*$//' \
    -e 's#^([A-Za-z][A-Za-z0-9+.-]*://[^/[:space:]]+).*$#\1#'
}

extract_caddy_routes() {
  local source="${1:?Caddy source is required}"
  awk '
    function delta(text, copy, opens, closes) {
      copy = text
      opens = gsub(/\{/, "{", copy)
      copy = text
      closes = gsub(/\}/, "}", copy)
      return opens - closes
    }
    BEGIN { in_site = 0; depth = 0 }
    {
      syntax = $0
      sub(/^[[:space:]]*#.*/, "", syntax)
      sub(/[[:space:]]+#.*$/, "", syntax)
      if (syntax ~ /^[[:space:]]*$/) next

      if (!in_site && syntax ~ /(^|[[:space:],])((www\.)?codestra\.co)([[:space:],{]|$)/) {
        in_site = 1
        depth = delta(syntax)
        print NR ":" syntax
        if (depth <= 0) in_site = 0
        next
      }
      if (in_site) {
        if (syntax ~ /^[[:space:]]*(reverse_proxy|redir)[[:space:]]+/) {
          print NR ":" syntax
        }
        depth += delta(syntax)
        if (depth <= 0) {
          in_site = 0
          depth = 0
        }
      }
    }
  ' "$source" 2>/dev/null | sed -n '1,120p'
}

extract_nginx_routes() {
  local source="${1:?Nginx source is required}"
  awk '
    function delta(text, copy, opens, closes) {
      copy = text
      opens = gsub(/\{/, "{", copy)
      copy = text
      closes = gsub(/\}/, "}", copy)
      return opens - closes
    }
    function flush_block() {
      if (target_site) printf "%s", evidence
      evidence = ""
      target_site = 0
    }
    BEGIN {
      in_server = 0
      depth = 0
      evidence = ""
      target_site = 0
    }
    {
      syntax = $0
      sub(/^[[:space:]]*#.*/, "", syntax)
      sub(/[[:space:]]+#.*$/, "", syntax)
      if (syntax ~ /^[[:space:]]*$/) next

      if (!in_server && syntax ~ /^[[:space:]]*server[[:space:]]*\{/) {
        in_server = 1
        depth = delta(syntax)
        evidence = NR ":" syntax "\n"
        target_site = 0
        next
      }

      if (in_server) {
        if (syntax ~ /^[[:space:]]*server_name[[:space:]]+/) {
          names = syntax
          sub(/^[[:space:]]*server_name[[:space:]]+/, "", names)
          sub(/;[[:space:]]*$/, "", names)
          name_count = split(names, server_names, /[[:space:]]+/)
          for (name_index = 1; name_index <= name_count; name_index++) {
            if (server_names[name_index] == "codestra.co" || server_names[name_index] == "www.codestra.co") {
              target_site = 1
            }
          }
        }
        if (syntax ~ /^[[:space:]]*(server_name|proxy_pass)[[:space:]]+/) {
          evidence = evidence NR ":" syntax "\n"
        }
        depth += delta(syntax)
        if (depth <= 0) {
          flush_block()
          in_server = 0
          depth = 0
        }
      }
    }
    END {
      if (in_server) flush_block()
    }
  ' "$source" 2>/dev/null | sed -n '1,160p'
}

echo "DISCOVERY_MODE=READ_ONLY"
echo "DISCOVERY_UTC=$(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "HOSTNAME=$(hostname)"
echo "KERNEL=$(uname -sr)"
echo "USER_ID=$(id -u)"
echo "GROUP_ID=$(id -g)"
echo "HOST_ADDRESSES=$(hostname -I 2>/dev/null | xargs || true)"

if command -v ip >/dev/null 2>&1; then
  ip -brief address 2>/dev/null | sed 's/^/ADDRESS=/' || true
else
  echo "IP_COMMAND=UNAVAILABLE"
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "DOCKER_COMMAND=MISSING"
  mark_fatal DOCKER_COMMAND_MISSING
else
  echo "DOCKER_COMMAND=AVAILABLE"

  set +e
  docker_server="$(docker version --format '{{.Server.Version}}' 2>/dev/null)"
  docker_rc=$?
  set -e
  if [[ "$docker_rc" -eq 0 && -n "$docker_server" ]]; then
    echo "DOCKER_SERVER=$docker_server"
  else
    echo "DOCKER_DAEMON=UNAVAILABLE_OR_UNAUTHORIZED"
    mark_fatal DOCKER_DAEMON_UNAVAILABLE
  fi

  set +e
  compose_version="$(docker compose version --short 2>/dev/null)"
  compose_rc=$?
  set -e
  if [[ "$compose_rc" -eq 0 && -n "$compose_version" ]]; then
    echo "DOCKER_COMPOSE=$compose_version"
  else
    echo "DOCKER_COMPOSE=UNAVAILABLE"
    mark_fatal DOCKER_COMPOSE_UNAVAILABLE
  fi
fi

containers=""
if [[ "$fatal_failures" -eq 0 ]]; then
  set +e
  containers="$(docker ps -a --format '{{.Names}}' 2>/dev/null)"
  containers_rc=$?
  set -e
  if [[ "$containers_rc" -ne 0 ]]; then
    mark_fatal CONTAINER_INVENTORY_FAILED
  elif [[ -z "$containers" ]]; then
    echo "CONTAINER_INVENTORY=EMPTY"
    mark_fatal CONTAINER_INVENTORY_EMPTY
  fi
fi

frontend_container=""
frontend_project=""
frontend_priority=0
frontend_networks=""
frontend_bindings=""
frontend_loopback_ports=""
site_working_dir=""
site_config_files=""

proxy_kind=""
proxy_container=""
proxy_project=""
proxy_service=""
proxy_priority=0
proxy_networks=""
proxy_config_source=""
proxy_routes=""

if [[ -n "$containers" ]]; then
  while IFS= read -r container; do
    [[ -n "$container" ]] || continue

    set +e
    summary="$(docker inspect "$container" --format \
      'project={{index .Config.Labels "com.docker.compose.project"}}|service={{index .Config.Labels "com.docker.compose.service"}}|working_dir={{index .Config.Labels "com.docker.compose.project.working_dir"}}|config_files={{index .Config.Labels "com.docker.compose.project.config_files"}}|image={{.Config.Image}}|image_id={{.Image}}|state={{.State.Status}}|health={{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}|restarts={{.RestartCount}}|ports={{json .NetworkSettings.Ports}}|networks={{range $name, $_ := .NetworkSettings.Networks}}{{$name}},{{end}}' \
      2>/dev/null)"
    inspect_rc=$?
    set -e

    if [[ "$inspect_rc" -ne 0 ]]; then
      echo "CONTAINER_INSPECT_FAILED=$container"
      continue
    fi

    project="$(sed -n 's/^project=\([^|]*\).*/\1/p' <<< "$summary")"
    service="$(sed -n 's/.*|service=\([^|]*\).*/\1/p' <<< "$summary")"
    state="$(sed -n 's/.*|state=\([^|]*\).*/\1/p' <<< "$summary")"

    if [[ "$container" == codestra-* || "$project" == codestra* ]]; then
      printf 'CONTAINER=%s|%s\n' "$container" "$summary" | safe_line
    fi

    if [[ ( "$project" == "codestra-prod" || "$project" == "codestra" ) && "$state" != "running" ]]; then
      echo "CANDIDATE_SKIPPED_NOT_RUNNING=$container|PROJECT=$project|SERVICE=$service|STATE=$state"
    fi

    candidate_frontend_priority=0
    if [[ "$project" == "codestra-prod" && "$service" == "frontend" && "$state" == "running" ]]; then
      candidate_frontend_priority=40
    elif [[ "$project" == "codestra-prod" && "$service" == "web" && "$state" == "running" ]]; then
      candidate_frontend_priority=35
    elif [[ "$project" == "codestra" && "$service" == "web" && "$state" == "running" ]]; then
      candidate_frontend_priority=30
    elif [[ "$project" == "codestra" && "$service" == "frontend" && "$state" == "running" ]]; then
      candidate_frontend_priority=25
    fi

    if [[ "$candidate_frontend_priority" -gt "$frontend_priority" ]]; then
      frontend_priority="$candidate_frontend_priority"
      frontend_container="$container"
      frontend_project="$project"
      site_working_dir="$(sed -n 's/.*|working_dir=\([^|]*\).*/\1/p' <<< "$summary")"
      site_config_files="$(sed -n 's/.*|config_files=\([^|]*\).*/\1/p' <<< "$summary")"
      frontend_networks="$(docker inspect "$container" --format '{{range $name, $_ := .NetworkSettings.Networks}}{{$name}}{{println}}{{end}}' 2>/dev/null || true)"
    fi

    candidate_proxy_priority=0
    if [[ "$project" == "codestra-prod" && ( "$service" == "caddy" || "$service" == "nginx" ) && "$state" == "running" ]]; then
      candidate_proxy_priority=40
    elif [[ "$project" == "codestra" && ( "$service" == "caddy" || "$service" == "nginx" ) && "$state" == "running" ]]; then
      candidate_proxy_priority=30
    fi

    if [[ "$candidate_proxy_priority" -gt "$proxy_priority" ]]; then
      proxy_priority="$candidate_proxy_priority"
      proxy_kind="container"
      proxy_container="$container"
      proxy_project="$project"
      proxy_service="$service"
      proxy_networks="$(docker inspect "$container" --format '{{range $name, $_ := .NetworkSettings.Networks}}{{$name}}{{println}}{{end}}' 2>/dev/null || true)"
    fi
  done <<< "$containers"
fi

if [[ -n "$frontend_container" ]]; then
  echo "FRONTEND_CONTAINER=$frontend_container"
  echo "FRONTEND_PROJECT=$frontend_project"
  echo "FRONTEND_SERVICE=$(docker inspect "$frontend_container" --format '{{index .Config.Labels "com.docker.compose.service"}}' 2>/dev/null || true)"
  echo "FRONTEND_WORKING_DIR=$site_working_dir"
  echo "FRONTEND_CONFIG_FILES=$site_config_files"
  echo "FRONTEND_NETWORKS=$(sed '/^$/d' <<< "$frontend_networks" | paste -sd, -)"
  docker inspect "$frontend_container" --format '{{range $name, $cfg := .NetworkSettings.Networks}}FRONTEND_NETWORK={{$name}}|ALIASES={{json $cfg.Aliases}}|IP={{$cfg.IPAddress}}{{println}}{{end}}' 2>/dev/null || true

  frontend_bindings="$(
    docker inspect "$frontend_container" --format \
      '{{range $port, $bindings := .NetworkSettings.Ports}}{{range $bindings}}FRONTEND_BINDING=CONTAINER_PORT={{$port}}|HOST_IP={{.HostIp}}|HOST_PORT={{.HostPort}}{{println}}{{end}}{{end}}' \
      2>/dev/null || true
  )"
  if [[ -n "$frontend_bindings" ]]; then
    printf '%s\n' "$frontend_bindings"
    while IFS= read -r binding; do
      [[ -n "$binding" ]] || continue
      host_ip="$(sed -n 's/.*|HOST_IP=\([^|]*\).*/\1/p' <<< "$binding")"
      host_port="$(sed -n 's/.*|HOST_PORT=\([^|]*\).*/\1/p' <<< "$binding")"
      if [[ ( "$host_ip" == "127.0.0.1" || "$host_ip" == "::1" ) && -n "$host_port" ]]; then
        if ! grep -Fxq "$host_port" <<< "$frontend_loopback_ports"; then
          frontend_loopback_ports+="${host_port}"$'\n'
        fi
      fi
    done <<< "$frontend_bindings"
  else
    echo "FRONTEND_BINDINGS=NONE"
  fi

  if [[ -n "$frontend_loopback_ports" ]]; then
    echo "FRONTEND_LOOPBACK_PORTS=$(sed '/^$/d' <<< "$frontend_loopback_ports" | paste -sd, -)"
  else
    echo "FRONTEND_LOOPBACK_PORTS=NONE"
  fi
else
  echo "FRONTEND_CONTAINER=NOT_IDENTIFIED"
  mark_fatal FRONTEND_CONTAINER_NOT_IDENTIFIED
fi

if [[ -z "$proxy_kind" ]]; then
  if command -v pgrep >/dev/null 2>&1; then
    if pgrep -x caddy >/dev/null 2>&1; then
      caddy_candidate="$config_root/caddy/Caddyfile"
      if [[ -r "$caddy_candidate" ]]; then
        proxy_kind="host"
        proxy_project="HOST"
        proxy_service="caddy"
        proxy_config_source="$caddy_candidate"
      else
        echo "HOST_CADDY_CONFIG=UNREADABLE_OR_MISSING"
      fi
    fi

    if [[ -z "$proxy_kind" ]] && pgrep -x nginx >/dev/null 2>&1; then
      shopt -s nullglob
      nginx_candidates=(
        "$config_root/nginx/sites-enabled/codestra.co"
        "$config_root/nginx/sites-enabled/codestra"
        "$config_root/nginx/conf.d/codestra.conf"
        "$config_root/nginx/sites-enabled/"*
        "$config_root/nginx/conf.d/"*.conf
        "$config_root/nginx/nginx.conf"
      )
      shopt -u nullglob

      for nginx_candidate in "${nginx_candidates[@]}"; do
        [[ -f "$nginx_candidate" && -r "$nginx_candidate" ]] || continue
        nginx_candidate_routes="$(extract_nginx_routes "$nginx_candidate")"
        if [[ -n "$nginx_candidate_routes" ]]; then
          proxy_kind="host"
          proxy_project="HOST"
          proxy_service="nginx"
          proxy_config_source="$nginx_candidate"
          break
        fi
      done
      [[ -n "$proxy_config_source" ]] || echo "HOST_NGINX_CONFIG=NOT_IDENTIFIED"
    fi
  else
    echo "PGREP_COMMAND=UNAVAILABLE"
  fi
fi

if [[ "$proxy_kind" == "container" ]]; then
  echo "PROXY_KIND=CONTAINER"
  echo "PROXY_CONTAINER=$proxy_container"
  echo "PROXY_PROJECT=$proxy_project"
  echo "PROXY_SERVICE=$proxy_service"
  echo "PROXY_NETWORKS=$(sed '/^$/d' <<< "$proxy_networks" | paste -sd, -)"
  docker inspect "$proxy_container" --format '{{range $name, $cfg := .NetworkSettings.Networks}}PROXY_NETWORK={{$name}}|ALIASES={{json $cfg.Aliases}}|IP={{$cfg.IPAddress}}{{println}}{{end}}' 2>/dev/null || true
elif [[ "$proxy_kind" == "host" ]]; then
  echo "PROXY_KIND=HOST"
  echo "PROXY_PROJECT=HOST"
  echo "PROXY_SERVICE=$proxy_service"
  printf 'PROXY_CONFIG_SOURCE=%s\n' "$proxy_config_source" | safe_line
else
  echo "PROXY_KIND=NOT_IDENTIFIED"
  mark_fatal PROXY_NOT_IDENTIFIED
fi

if [[ "$proxy_kind" == "container" && -n "$frontend_container" && "$frontend_project" != "$proxy_project" ]]; then
  echo "FRONTEND_PROXY_PROJECT_MISMATCH=FRONTEND:$frontend_project|PROXY:$proxy_project"
  mark_fatal FRONTEND_PROXY_PROJECT_MISMATCH
fi

if [[ "$proxy_kind" == "container" && -n "$frontend_container" ]]; then
  shared_networks=""
  while IFS= read -r network; do
    [[ -n "$network" ]] || continue
    if grep -Fxq "$network" <<< "$proxy_networks"; then
      shared_networks+="${network}"$'\n'
    fi
  done <<< "$frontend_networks"

  if [[ -n "$shared_networks" ]]; then
    echo "FRONTEND_PROXY_SHARED_NETWORKS=$(sed '/^$/d' <<< "$shared_networks" | paste -sd, -)"
  else
    echo "FRONTEND_PROXY_SHARED_NETWORKS=NONE"
    mark_fatal SHARED_DOCKER_NETWORK_NOT_IDENTIFIED
  fi
elif [[ "$proxy_kind" == "host" && -n "$frontend_container" ]]; then
  echo "FRONTEND_PROXY_LINK=HOST_LOOPBACK"
  if [[ -z "$frontend_loopback_ports" ]]; then
    mark_fatal HOST_PROXY_LOOPBACK_BINDING_NOT_IDENTIFIED
  fi
else
  echo "SITE_FRONTEND_PROXY_LINK=INCOMPLETE"
fi

for candidate_path in "$site_working_dir" "$site_config_files"; do
  [[ -n "$candidate_path" ]] || continue
  IFS=',' read -ra paths <<< "$candidate_path"
  for path in "${paths[@]}"; do
    path="$(xargs <<< "$path")"
    [[ "$path" == /* ]] || continue
    if [[ -e "$path" ]]; then
      stat -Lc 'RUNTIME_PATH=%n|TYPE=%F|OWNER=%U:%G|MODE=%a|DEVICE=%d' "$path" 2>/dev/null || true
    else
      echo "RUNTIME_PATH_MISSING=$path"
    fi
  done
done

if [[ -n "$site_working_dir" && "$site_working_dir" == /* ]]; then
  for relative in current releases compose.production.yaml Caddyfile; do
    path="${site_working_dir%/}/$relative"
    if [[ -L "$path" ]]; then
      target="$(readlink -f "$path" 2>/dev/null || true)"
      echo "DISCOVERED_LINK=$path|TARGET=$target"
    elif [[ -e "$path" ]]; then
      stat -Lc 'DISCOVERED_PATH=%n|TYPE=%F|OWNER=%U:%G|MODE=%a|DEVICE=%d' "$path" 2>/dev/null || true
    else
      echo "DISCOVERED_PATH_MISSING=$path"
    fi
  done
fi

if [[ "$proxy_kind" == "container" ]]; then
  if [[ "$proxy_service" == "caddy" ]]; then
    proxy_config_source="$(docker inspect "$proxy_container" --format '{{range .Mounts}}{{if eq .Destination "/etc/caddy/Caddyfile"}}{{.Source}}{{end}}{{end}}' 2>/dev/null || true)"
  elif [[ "$proxy_service" == "nginx" ]]; then
    proxy_config_source="$(docker inspect "$proxy_container" --format '{{range .Mounts}}{{if eq .Destination "/etc/nginx/nginx.conf"}}{{.Source}}{{end}}{{end}}' 2>/dev/null || true)"
    if [[ -z "$proxy_config_source" ]]; then
      proxy_config_source="$(docker inspect "$proxy_container" --format '{{range .Mounts}}{{if eq .Destination "/etc/nginx/conf.d/default.conf"}}{{.Source}}{{end}}{{end}}' 2>/dev/null || true)"
    fi
  fi
fi

if [[ -n "$proxy_config_source" && -r "$proxy_config_source" ]]; then
  printf 'PROXY_ROUTE_CONFIG_SOURCE=%s\n' "$proxy_config_source" | safe_line
  if [[ "$proxy_service" == "caddy" ]]; then
    echo "CADDY_ROUTE_SCOPE=SITE_DECLARATIONS_REVERSE_PROXY_REDIRECT_ONLY"
    proxy_routes="$(extract_caddy_routes "$proxy_config_source")"
    route_prefix="CADDY_ROUTE"
  else
    echo "NGINX_ROUTE_SCOPE=SERVER_NAME_PROXY_PASS_ONLY"
    proxy_routes="$(extract_nginx_routes "$proxy_config_source")"
    route_prefix="NGINX_ROUTE"
  fi

  if [[ -n "$proxy_routes" ]]; then
    while IFS= read -r line; do
      printf '%s=%s\n' "$route_prefix" "$line" | safe_line
    done <<< "$proxy_routes"
  else
    echo "PROXY_ROUTE=NOT_IDENTIFIED"
    mark_fatal PROXY_ROUTE_NOT_IDENTIFIED
  fi
else
  echo "PROXY_ROUTE_CONFIG=UNREADABLE_OR_MISSING"
  mark_fatal PROXY_ROUTE_CONFIG_UNREADABLE
fi

if [[ "$proxy_kind" == "host" && -n "$frontend_loopback_ports" && -n "$proxy_routes" ]]; then
  host_route_verified=0
  verified_host_port=""
  while IFS= read -r host_port; do
    [[ -n "$host_port" ]] || continue
    if grep -Eiq "(reverse_proxy|proxy_pass)[[:space:]]+(https?://)?(127\\.0\\.0\\.1|localhost|\\[::1\\]):${host_port}([/;[:space:]]|$)" <<< "$proxy_routes"; then
      host_route_verified=1
      verified_host_port="$host_port"
      break
    fi
  done <<< "$frontend_loopback_ports"

  if [[ "$host_route_verified" -eq 1 ]]; then
    echo "HOST_PROXY_LOOPBACK_ROUTE=PASS|PORT=$verified_host_port"
  else
    echo "HOST_PROXY_LOOPBACK_ROUTE=FAIL"
    mark_fatal HOST_PROXY_LOOPBACK_ROUTE_NOT_VERIFIED
  fi
fi

if command -v ss >/dev/null 2>&1; then
  ss -H -ltn 2>/dev/null | sed 's/^/TCP_LISTENER=/' || true
else
  echo "SS_COMMAND=UNAVAILABLE"
fi

if command -v curl >/dev/null 2>&1; then
  for url in https://codestra.co/en/ https://www.codestra.co/en/; do
    set +e
    probe_result="$(
      curl --silent --location --max-time 15 \
        --output /dev/null \
        --write-out $'%{http_code}\n%{remote_ip}\n%{url_effective}' \
        "$url" 2>/dev/null
    )"
    curl_rc=$?
    set -e

    mapfile -t probe_fields <<< "$probe_result"
    http_code="${probe_fields[0]:-000}"
    remote_ip="${probe_fields[1]:-UNAVAILABLE}"
    effective_url="${probe_fields[2]:-}"
    if [[ -n "$effective_url" ]]; then
      effective_origin="$(printf '%s' "$effective_url" | sanitize_effective_origin)"
    else
      effective_origin="UNAVAILABLE"
    fi

    printf 'PUBLIC_PROBE_REQUEST=%s|RC=%s|HTTP=%s|REMOTE_IP=%s|EFFECTIVE_ORIGIN=%s\n' \
      "$url" \
      "$curl_rc" \
      "$http_code" \
      "$remote_ip" \
      "$effective_origin" \
      | safe_line
  done
else
  echo "CURL_COMMAND=UNAVAILABLE"
fi

echo "DISCOVERY_FATAL_FAILURE_COUNT=$fatal_failures"
if [[ "$fatal_failures" -eq 0 ]]; then
  echo "DISCOVERY_STATUS=PASS"
else
  echo "DISCOVERY_STATUS=FAIL"
fi
echo "PREFLIGHT_REMOTE_WRITE_COUNT=0"

if [[ "$fatal_failures" -ne 0 ]]; then
  exit 10
fi
