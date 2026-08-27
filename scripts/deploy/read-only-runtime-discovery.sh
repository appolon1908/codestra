#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'
umask 077

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
proxy_container=""
proxy_project=""
proxy_priority=0
site_working_dir=""
site_config_files=""
frontend_networks=""
proxy_networks=""

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
      proxy_container="$container"
      proxy_project="$project"
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
else
  echo "FRONTEND_CONTAINER=NOT_IDENTIFIED"
  mark_fatal FRONTEND_CONTAINER_NOT_IDENTIFIED
fi

if [[ -n "$proxy_container" ]]; then
  echo "PROXY_CONTAINER=$proxy_container"
  echo "PROXY_PROJECT=$proxy_project"
  echo "PROXY_SERVICE=$(docker inspect "$proxy_container" --format '{{index .Config.Labels "com.docker.compose.service"}}' 2>/dev/null || true)"
  echo "PROXY_NETWORKS=$(sed '/^$/d' <<< "$proxy_networks" | paste -sd, -)"
  docker inspect "$proxy_container" --format '{{range $name, $cfg := .NetworkSettings.Networks}}PROXY_NETWORK={{$name}}|ALIASES={{json $cfg.Aliases}}|IP={{$cfg.IPAddress}}{{println}}{{end}}' 2>/dev/null || true
else
  echo "PROXY_CONTAINER=NOT_IDENTIFIED"
  mark_fatal PROXY_CONTAINER_NOT_IDENTIFIED
fi

if [[ -n "$frontend_container" && -n "$proxy_container" && "$frontend_project" != "$proxy_project" ]]; then
  echo "FRONTEND_PROXY_PROJECT_MISMATCH=FRONTEND:$frontend_project|PROXY:$proxy_project"
  mark_fatal FRONTEND_PROXY_PROJECT_MISMATCH
fi

if [[ -n "$frontend_container" && -n "$proxy_container" ]]; then
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
else
  echo "SITE_CONTAINER_PAIR=INCOMPLETE"
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

if [[ -n "$proxy_container" ]]; then
  proxy_service="$(docker inspect "$proxy_container" --format '{{index .Config.Labels "com.docker.compose.service"}}' 2>/dev/null || true)"
  if [[ "$proxy_service" == "caddy" || "$proxy_container" == *caddy* ]]; then
    caddy_source="$(docker inspect "$proxy_container" --format '{{range .Mounts}}{{if eq .Destination "/etc/caddy/Caddyfile"}}{{.Source}}{{end}}{{end}}' 2>/dev/null || true)"
    if [[ -n "$caddy_source" ]]; then
      echo "CADDY_CONFIG_SOURCE=$caddy_source"
      if [[ -r "$caddy_source" ]]; then
        echo "CADDY_ROUTE_SCOPE=SITE_DECLARATIONS_REVERSE_PROXY_REDIRECT_ONLY"
        set +e
        caddy_excerpt="$(
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
          ' "$caddy_source" 2>/dev/null | sed -n '1,120p'
        )"
        excerpt_rc=$?
        set -e
        if [[ "$excerpt_rc" -eq 0 && -n "$caddy_excerpt" ]]; then
          while IFS= read -r line; do
            printf 'CADDY_ROUTE=%s\n' "$line" | safe_line
          done <<< "$caddy_excerpt"
        else
          echo "CADDY_ROUTE=NOT_IDENTIFIED"
        fi
      else
        echo "CADDY_CONFIG_SOURCE=NOT_READABLE"
      fi
    else
      echo "CADDY_CONFIG_SOURCE=NOT_MOUNTED_AT_EXPECTED_PATH"
    fi
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
