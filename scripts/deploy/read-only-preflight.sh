#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'
umask 077

release_root="${1:?release_root is required}"
releases_dir="${2:?releases_dir is required}"
current_symlink="${3:?current_symlink is required}"
compose_project="${4:?compose_project is required}"
service_name="${5:?service_name is required}"
loopback_port="${6:?loopback_port is required}"
reverse_proxy="${7:?reverse_proxy is required}"
preflight_mode="${8:-evidence}"

safe_path='^/[A-Za-z0-9._/-]+$'
safe_name='^[A-Za-z0-9][A-Za-z0-9_.-]*$'
safe_port='^[0-9]{4,5}$'
safe_image='^ghcr\.io/[a-z0-9_.-]+/[a-z0-9_.-]+@sha256:[a-f0-9]{64}$'

for value in "$release_root" "$releases_dir" "$current_symlink"; do
  [[ "$value" =~ $safe_path ]] || { echo "ERROR=UNSAFE_PATH"; exit 2; }
  [[ "$value" != *".."* && "$value" != *"//"* ]] || { echo "ERROR=UNSAFE_PATH"; exit 2; }
done

[[ "$compose_project" =~ $safe_name ]] || { echo "ERROR=UNSAFE_PROJECT"; exit 2; }
[[ "$service_name" =~ $safe_name ]] || { echo "ERROR=UNSAFE_SERVICE"; exit 2; }
[[ "$loopback_port" =~ $safe_port ]] || { echo "ERROR=UNSAFE_PORT"; exit 2; }
[[ "$reverse_proxy" == "caddy" || "$reverse_proxy" == "nginx" ]] || { echo "ERROR=UNSAFE_PROXY"; exit 2; }
[[ "$preflight_mode" == "evidence" || "$preflight_mode" == "activation" ]] \
  || { echo "ERROR=UNSAFE_PREFLIGHT_MODE"; exit 2; }

failures=()
mark_failure() {
  failures+=("$1")
  echo "PREFLIGHT_FAILURE=$1"
}

echo "PREFLIGHT_MODE=READ_ONLY"
echo "PREFLIGHT_STRICTNESS=${preflight_mode^^}"
echo "PREFLIGHT_UTC=$(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "HOSTNAME=$(hostname)"
echo "KERNEL=$(uname -sr)"
echo "USER_ID=$(id -u)"
echo "GROUP_ID=$(id -g)"

if command -v docker >/dev/null 2>&1; then
  echo "DOCKER_COMMAND=AVAILABLE"

  set +e
  docker_server="$(docker version --format '{{.Server.Version}}' 2>/dev/null)"
  docker_rc=$?
  set -e
  if [[ "$docker_rc" -eq 0 && -n "$docker_server" ]]; then
    echo "DOCKER_SERVER=$docker_server"
  else
    echo "DOCKER_DAEMON=UNAVAILABLE_OR_UNAUTHORIZED"
    mark_failure DOCKER_DAEMON_UNAVAILABLE
  fi

  set +e
  compose_version="$(docker compose version --short 2>/dev/null)"
  compose_rc=$?
  set -e
  if [[ "$compose_rc" -eq 0 && -n "$compose_version" ]]; then
    echo "DOCKER_COMPOSE=$compose_version"
  else
    echo "DOCKER_COMPOSE=UNAVAILABLE"
    mark_failure DOCKER_COMPOSE_UNAVAILABLE
  fi

  set +e
  compose_containers="$(
    docker ps \
      --filter "label=com.docker.compose.project=${compose_project}" \
      --filter "label=com.docker.compose.service=${service_name}" \
      --format '{{.Names}}|{{.Image}}|{{.Status}}|{{.Ports}}' \
      2>/dev/null
  )"
  containers_rc=$?
  set -e
  if [[ "$containers_rc" -ne 0 ]]; then
    echo "COMPOSE_CONTAINERS=UNAVAILABLE_OR_UNAUTHORIZED"
    mark_failure COMPOSE_CONTAINER_QUERY_FAILED
  elif [[ -z "$compose_containers" ]]; then
    echo "COMPOSE_CONTAINERS=NONE"
    mark_failure COMPOSE_SERVICE_NOT_RUNNING
  else
    while IFS= read -r line; do
      echo "COMPOSE_CONTAINER=$line"
    done <<< "$compose_containers"
  fi
else
  echo "DOCKER_COMMAND=MISSING"
  mark_failure DOCKER_COMMAND_MISSING
fi

for path in "$release_root" "$releases_dir"; do
  if [[ -d "$path" ]]; then
    stat -Lc "PATH=%n|TYPE=directory|OWNER=%U:%G|MODE=%a|DEVICE=%d" "$path"
    if [[ -w "$path" ]]; then
      echo "PATH_WRITABLE_BY_DEPLOY_USER=$path"
    else
      echo "PATH_NOT_WRITABLE_BY_DEPLOY_USER=$path"
      mark_failure "PATH_NOT_WRITABLE:${path}"
    fi
  else
    echo "PATH_MISSING=$path"
    mark_failure "PATH_MISSING:${path}"
  fi
done

current_target=""
if [[ -L "$current_symlink" ]]; then
  echo "CURRENT_LINK=$current_symlink"
  current_target="$(readlink -f "$current_symlink" 2>/dev/null || true)"
  if [[ -n "$current_target" ]]; then
    echo "CURRENT_TARGET=$current_target"
  else
    mark_failure CURRENT_TARGET_UNRESOLVED
  fi
elif [[ -e "$current_symlink" ]]; then
  stat -Lc "CURRENT_PATH=%n|TYPE=%F|OWNER=%U:%G|MODE=%a" "$current_symlink"
  mark_failure CURRENT_PATH_NOT_SYMLINK
else
  echo "CURRENT_PATH_MISSING=$current_symlink"
  mark_failure CURRENT_PATH_MISSING
fi

if [[ -n "$current_target" ]]; then
  if [[ "$current_target" != "$releases_dir"/* ]]; then
    mark_failure CURRENT_TARGET_OUTSIDE_RELEASES
  fi
  if [[ ! -f "$current_target/compose.yaml" || ! -f "$current_target/.env" ]]; then
    mark_failure CURRENT_RELEASE_INCOMPLETE
  else
    previous_image_ref="$(
      sed -n 's/^IMAGE_REF=//p' "$current_target/.env" | head -n 1
    )"
    if [[ "$previous_image_ref" =~ $safe_image ]]; then
      echo "ROLLBACK_IMAGE_REF=$previous_image_ref"
      if command -v docker >/dev/null 2>&1 \
        && docker image inspect "$previous_image_ref" >/dev/null 2>&1; then
        echo "ROLLBACK_IMAGE_CACHED=YES"
      else
        echo "ROLLBACK_IMAGE_CACHED=NO"
        mark_failure ROLLBACK_IMAGE_NOT_CACHED
      fi
    else
      echo "ROLLBACK_IMAGE_REF=INVALID_OR_MISSING"
      mark_failure ROLLBACK_IMAGE_INVALID
    fi
  fi
fi

if command -v ss >/dev/null 2>&1; then
  listeners="$(ss -H -ltn "sport = :${loopback_port}" 2>/dev/null || true)"
  if [[ -n "$listeners" ]]; then
    while IFS= read -r line; do
      echo "LISTENER=$line"
    done <<< "$listeners"
    if grep -Eq "(^|[[:space:]])127\\.0\\.0\\.1:${loopback_port}([[:space:]]|$)" <<< "$listeners"; then
      echo "LOOPBACK_BINDING=PASS"
    else
      echo "LOOPBACK_BINDING=NON_LOOPBACK_OR_UNVERIFIED"
      mark_failure LOOPBACK_BINDING_INVALID
    fi
  else
    echo "LOOPBACK_PORT_NOT_LISTENING=${loopback_port}"
    mark_failure LOOPBACK_PORT_NOT_LISTENING
  fi
else
  echo "SS_COMMAND=MISSING"
  mark_failure SS_COMMAND_MISSING
fi

if command -v findmnt >/dev/null 2>&1; then
  findmnt -T "$release_root" -no TARGET,SOURCE,FSTYPE,OPTIONS 2>/dev/null \
    | sed 's/^/RELEASE_MOUNT=/' || echo "RELEASE_MOUNT=UNAVAILABLE"
fi

if command -v systemctl >/dev/null 2>&1; then
  set +e
  proxy_state="$(systemctl is-active "$reverse_proxy" 2>/dev/null)"
  proxy_rc=$?
  set -e
  echo "REVERSE_PROXY_${reverse_proxy^^}=${proxy_state:-UNAVAILABLE}"
  if [[ "$proxy_rc" -ne 0 || "$proxy_state" != "active" ]]; then
    mark_failure REVERSE_PROXY_INACTIVE
  fi
else
  echo "SYSTEMCTL_COMMAND=MISSING"
  mark_failure SYSTEMCTL_COMMAND_MISSING
fi

failure_count="${#failures[@]}"
echo "PREFLIGHT_FAILURE_COUNT=$failure_count"
if [[ "$failure_count" -eq 0 ]]; then
  echo "PREFLIGHT_READINESS=PASS"
else
  echo "PREFLIGHT_READINESS=FAIL"
fi
echo "PREFLIGHT_REMOTE_WRITE_COUNT=0"

if [[ "$preflight_mode" == "activation" && "$failure_count" -ne 0 ]]; then
  exit 10
fi
