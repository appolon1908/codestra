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
    -e 's#([^|[:space:]]*(secret|token|password|credential|private)[^|[:space:]]*)#REDACTED_PATH#Ig'
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
  fi
fi

frontend_container=""
proxy_container=""
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

    if [[ "$container" == codestra-* || "$project" == codestra* ]]; then
      printf 'CONTAINER=%s|%s\n' "$container" "$summary" | safe_line
    fi

    if [[ -z "$frontend_container" && ( "$service" == "frontend" || "$container" == codestra-prod-frontend-* ) ]]; then
      frontend_container="$container"
      site_working_dir="$(sed -n 's/.*|working_dir=\([^|]*\).*/\1/p' <<< "$summary")"
      site_config_files="$(sed -n 's/.*|config_files=\([^|]*\).*/\1/p' <<< "$summary")"
      frontend_networks="$(docker inspect "$container" --format '{{range $name, $_ := .NetworkSettings.Networks}}{{$name}} {{end}}' 2>/dev/null || true)"
      echo "FRONTEND_CONTAINER=$frontend_container"
      echo "FRONTEND_PROJECT=$project"
      echo "FRONTEND_SERVICE=$service"
      echo "FRONTEND_WORKING_DIR=$site_working_dir"
      echo "FRONTEND_CONFIG_FILES=$site_config_files"
      echo "FRONTEND_NETWORKS=$(xargs <<< "$frontend_networks" || true)"
      docker inspect "$container" --format '{{range $name, $cfg := .NetworkSettings.Networks}}FRONTEND_NETWORK={{$name}}|ALIASES={{json $cfg.Aliases}}|IP={{$cfg.IPAddress}}{{println}}{{end}}' 2>/dev/null || true
    fi

    if [[ -z "$proxy_container" && ( "$service" == "caddy" || "$service" == "nginx" || "$container" == codestra-prod-caddy-* ) ]]; then
      proxy_container="$container"
      proxy_networks="$(docker inspect "$container" --format '{{range $name, $_ := .NetworkSettings.Networks}}{{$name}} {{end}}' 2>/dev/null || true)"
      echo "PROXY_CONTAINER=$proxy_container"
      echo "PROXY_PROJECT=$project"
      echo "PROXY_SERVICE=$service"
      echo "PROXY_NETWORKS=$(xargs <<< "$proxy_networks" || true)"
      docker inspect "$container" --format '{{range $name, $cfg := .NetworkSettings.Networks}}PROXY_NETWORK={{$name}}|ALIASES={{json $cfg.Aliases}}|IP={{$cfg.IPAddress}}{{println}}{{end}}' 2>/dev/null || true
    fi
  done <<< "$containers"
fi

if [[ -n "$frontend_container" && -n "$proxy_container" ]]; then
  shared_networks=""
  for network in $frontend_networks; do
    if grep -Eq "(^|[[:space:]])${network}([[:space:]]|$)" <<< "$proxy_networks"; then
      shared_networks+="${network} "
    fi
  done
  if [[ -n "$shared_networks" ]]; then
    echo "FRONTEND_PROXY_SHARED_NETWORKS=$(xargs <<< "$shared_networks")"
  else
    echo "FRONTEND_PROXY_SHARED_NETWORKS=NONE"
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
        set +e
        caddy_excerpt="$(grep -n -E -B 4 -A 24 '(^|[[:space:],])((www\.)?codestra\.co)([[:space:],{]|$)|reverse_proxy[[:space:]]+frontend(:[0-9]+)?' "$caddy_source" 2>/dev/null | sed -n '1,220p')"
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
    result="$(curl --silent --show-error --location --max-time 15 --output /dev/null --write-out '%{http_code}|%{remote_ip}|%{url_effective}' "$url" 2>&1)"
    curl_rc=$?
    set -e
    echo "PUBLIC_PROBE=$url|RC=$curl_rc|RESULT=$result"
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
