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

safe_path='^/[A-Za-z0-9._/-]+$'
safe_name='^[A-Za-z0-9][A-Za-z0-9_.-]*$'
safe_port='^[0-9]{4,5}$'

for value in "$release_root" "$releases_dir" "$current_symlink"; do
  [[ "$value" =~ $safe_path ]] || { echo "ERROR=UNSAFE_PATH"; exit 2; }
  [[ "$value" != *".."* && "$value" != *"//"* ]] || { echo "ERROR=UNSAFE_PATH"; exit 2; }
done

[[ "$compose_project" =~ $safe_name ]] || { echo "ERROR=UNSAFE_PROJECT"; exit 2; }
[[ "$service_name" =~ $safe_name ]] || { echo "ERROR=UNSAFE_SERVICE"; exit 2; }
[[ "$loopback_port" =~ $safe_port ]] || { echo "ERROR=UNSAFE_PORT"; exit 2; }
[[ "$reverse_proxy" == "caddy" || "$reverse_proxy" == "nginx" ]] || { echo "ERROR=UNSAFE_PROXY"; exit 2; }

echo "PREFLIGHT_MODE=READ_ONLY"
echo "PREFLIGHT_UTC=$(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "HOSTNAME=$(hostname)"
echo "KERNEL=$(uname -sr)"
echo "USER_ID=$(id -u)"
echo "GROUP_ID=$(id -g)"

if command -v docker >/dev/null 2>&1; then
  echo "DOCKER_COMMAND=AVAILABLE"
  docker version --format 'DOCKER_SERVER={{.Server.Version}}' 2>/dev/null \
    || echo "DOCKER_DAEMON=UNAVAILABLE_OR_UNAUTHORIZED"
  docker compose version --short 2>/dev/null | sed 's/^/DOCKER_COMPOSE=/' \
    || echo "DOCKER_COMPOSE=UNAVAILABLE"
  docker ps \
    --filter "label=com.docker.compose.project=${compose_project}" \
    --format 'COMPOSE_CONTAINER={{.Names}}|{{.Image}}|{{.Status}}|{{.Ports}}' \
    2>/dev/null || echo "COMPOSE_CONTAINERS=UNAVAILABLE_OR_UNAUTHORIZED"
else
  echo "DOCKER_COMMAND=MISSING"
fi

for path in "$release_root" "$releases_dir"; do
  if [[ -d "$path" ]]; then
    stat -Lc "PATH=%n|TYPE=directory|OWNER=%U:%G|MODE=%a|DEVICE=%d" "$path"
    if [[ -w "$path" ]]; then
      echo "PATH_WRITABLE_BY_DEPLOY_USER=$path"
    else
      echo "PATH_NOT_WRITABLE_BY_DEPLOY_USER=$path"
    fi
  else
    echo "PATH_MISSING=$path"
  fi
done

if [[ -L "$current_symlink" ]]; then
  echo "CURRENT_LINK=$current_symlink"
  readlink "$current_symlink" | sed 's/^/CURRENT_TARGET=/'
elif [[ -e "$current_symlink" ]]; then
  stat -Lc "CURRENT_PATH=%n|TYPE=%F|OWNER=%U:%G|MODE=%a" "$current_symlink"
else
  echo "CURRENT_PATH_MISSING=$current_symlink"
fi

if command -v ss >/dev/null 2>&1; then
  if ss -H -ltn "sport = :${loopback_port}" 2>/dev/null | grep -q .; then
    echo "LOOPBACK_PORT_LISTENING=${loopback_port}"
    ss -H -ltn "sport = :${loopback_port}" 2>/dev/null | sed 's/^/LISTENER=/'
  else
    echo "LOOPBACK_PORT_NOT_LISTENING=${loopback_port}"
  fi
else
  echo "SS_COMMAND=MISSING"
fi

if command -v findmnt >/dev/null 2>&1; then
  findmnt -T "$release_root" -no TARGET,SOURCE,FSTYPE,OPTIONS 2>/dev/null \
    | sed 's/^/RELEASE_MOUNT=/' || echo "RELEASE_MOUNT=UNAVAILABLE"
fi

if command -v systemctl >/dev/null 2>&1; then
  systemctl is-active "$reverse_proxy" 2>/dev/null \
    | sed "s/^/REVERSE_PROXY_${reverse_proxy^^}=/" \
    || echo "REVERSE_PROXY_${reverse_proxy^^}=INACTIVE_OR_UNAVAILABLE"
else
  echo "SYSTEMCTL_COMMAND=MISSING"
fi

echo "PREFLIGHT_REMOTE_WRITE_COUNT=0"
