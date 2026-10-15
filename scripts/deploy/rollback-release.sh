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
health_path="${7:?health_path is required}"
release_dir="${8:?release_dir is required}"

safe_path='^/[A-Za-z0-9._/-]+$'
safe_name='^[A-Za-z0-9][A-Za-z0-9_.-]*$'
safe_port='^[0-9]{4,5}$'
safe_health='^/[A-Za-z0-9._~!$&()*+,;=:@%/-]*$'
safe_image='^ghcr\.io/[a-z0-9_.-]+/[a-z0-9_.-]+@sha256:[a-f0-9]{64}$'

for value in "$release_root" "$releases_dir" "$current_symlink" "$release_dir"; do
  [[ "$value" =~ $safe_path ]] || { echo "ERROR=UNSAFE_PATH"; exit 2; }
  [[ "$value" != *".."* && "$value" != *"//"* ]] || { echo "ERROR=UNSAFE_PATH"; exit 2; }
done

[[ "$release_root" =~ ^/(srv|opt|data|mnt/[A-Za-z0-9._-]+|var/(lib|www)|home/[A-Za-z0-9._-]+)/[A-Za-z0-9._/-]+$ ]] \
  || { echo "ERROR=RELEASE_ROOT_NOT_DEDICATED"; exit 2; }
[[ "$releases_dir" == "$release_root"/* ]] || { echo "ERROR=RELEASES_DIR_OUTSIDE_ROOT"; exit 2; }
[[ "$current_symlink" == "$release_root"/* ]] || { echo "ERROR=CURRENT_LINK_OUTSIDE_ROOT"; exit 2; }
[[ "$release_dir" == "$releases_dir"/* ]] || { echo "ERROR=RELEASE_DIR_OUTSIDE_RELEASES"; exit 2; }
[[ "$compose_project" =~ $safe_name ]] || { echo "ERROR=UNSAFE_PROJECT"; exit 2; }
[[ "$service_name" =~ $safe_name ]] || { echo "ERROR=UNSAFE_SERVICE"; exit 2; }
[[ "$loopback_port" =~ $safe_port ]] || { echo "ERROR=UNSAFE_PORT"; exit 2; }
[[ "$health_path" =~ $safe_health ]] || { echo "ERROR=UNSAFE_HEALTH_PATH"; exit 2; }

[[ -f "$release_dir/compose.yaml" && -f "$release_dir/.env" ]] \
  || { echo "ERROR=CANDIDATE_RELEASE_INCOMPLETE"; exit 3; }
[[ -f "$release_dir/.previous-release" ]] \
  || { echo "ERROR=PREVIOUS_RELEASE_METADATA_MISSING"; exit 3; }
previous_target="$(cat "$release_dir/.previous-release")"
[[ "$previous_target" =~ $safe_path ]] || { echo "ERROR=UNSAFE_PREVIOUS_TARGET"; exit 3; }
[[ "$previous_target" == "$releases_dir"/* ]] || { echo "ERROR=PREVIOUS_TARGET_OUTSIDE_RELEASES"; exit 3; }
[[ "$previous_target" != "$release_dir" ]] || { echo "ERROR=PREVIOUS_TARGET_EQUALS_CURRENT_RELEASE"; exit 3; }
[[ -f "$previous_target/compose.yaml" && -f "$previous_target/.env" ]] \
  || { echo "ERROR=PREVIOUS_RELEASE_INCOMPLETE"; exit 3; }

previous_image_ref="$(sed -n 's/^IMAGE_REF=//p' "$previous_target/.env" | head -n 1)"
[[ "$previous_image_ref" =~ $safe_image ]] \
  || { echo "ERROR=PREVIOUS_IMAGE_REF_INVALID"; exit 3; }

command -v docker >/dev/null 2>&1 || { echo "ERROR=DOCKER_MISSING"; exit 3; }
docker compose version >/dev/null 2>&1 || { echo "ERROR=DOCKER_COMPOSE_MISSING"; exit 3; }
command -v flock >/dev/null 2>&1 || { echo "ERROR=FLOCK_MISSING"; exit 3; }
command -v curl >/dev/null 2>&1 || { echo "ERROR=CURL_MISSING"; exit 3; }

if [[ "${CODESTRA_DEPLOY_LOCK_HELD:-0}" != "1" ]]; then
  exec 9>"${release_root}/.deploy.lock"
  flock -n 9 || { echo "ERROR=DEPLOYMENT_ALREADY_RUNNING"; exit 4; }
fi

contain_candidate() {
  local down_rc stop_rc

  set +e
  docker compose \
    --env-file "$release_dir/.env" \
    --project-name "$compose_project" \
    --file "$release_dir/compose.yaml" \
    down --remove-orphans
  down_rc=$?
  set -e

  if [[ "$down_rc" -eq 0 ]]; then
    echo "ROLLBACK_CONTAINMENT=PASS_DOWN"
    return 0
  fi

  set +e
  docker compose \
    --env-file "$release_dir/.env" \
    --project-name "$compose_project" \
    --file "$release_dir/compose.yaml" \
    stop "$service_name"
  stop_rc=$?
  set -e

  if [[ "$stop_rc" -eq 0 ]]; then
    echo "ROLLBACK_CONTAINMENT=PASS_STOP"
    return 0
  fi

  echo "ROLLBACK_CONTAINMENT=FAILED"
  echo "ROLLBACK_CONTAINMENT_DOWN_RC=$down_rc"
  echo "ROLLBACK_CONTAINMENT_STOP_RC=$stop_rc"
  return 1
}

fail_rollback() {
  local reason="$1"
  local exit_code="$2"

  echo "ROLLBACK_STATUS=FAILED"
  echo "ROLLBACK_FAILURE=$reason"
  if contain_candidate; then
    echo "ROLLBACK_FAIL_SAFE=KNOWN_BAD_CANDIDATE_NOT_SERVING"
  else
    echo "ROLLBACK_FAIL_SAFE=CONTAINMENT_UNCONFIRMED"
  fi
  exit "$exit_code"
}

set +e
docker compose \
  --env-file "$previous_target/.env" \
  --project-name "$compose_project" \
  --file "$previous_target/compose.yaml" \
  up -d --no-build --pull never --wait
restore_rc=$?
set -e
[[ "$restore_rc" -eq 0 ]] || fail_rollback PREVIOUS_COMPOSE_UP_FAILED 5

health_ok=0
for attempt in 1 2 3 4 5 6; do
  if curl --fail --silent --show-error \
    "http://127.0.0.1:${loopback_port}${health_path}" >/dev/null; then
    health_ok=1
    break
  fi
  [[ "$attempt" -lt 6 ]] && sleep 5
done
[[ "$health_ok" -eq 1 ]] || fail_rollback PREVIOUS_HEALTH_FAILED 6

set +e
container_id="$(
  docker compose \
    --env-file "$previous_target/.env" \
    --project-name "$compose_project" \
    --file "$previous_target/compose.yaml" \
    ps --quiet "$service_name"
)"
ps_rc=$?
set -e
[[ "$ps_rc" -eq 0 && -n "$container_id" ]] \
  || fail_rollback PREVIOUS_SERVICE_MISSING 7

set +e
running_image="$(docker inspect --format '{{.Image}}' "$container_id")"
running_rc=$?
expected_image="$(docker image inspect --format '{{.Id}}' "$previous_image_ref")"
expected_rc=$?
set -e
[[ "$running_rc" -eq 0 && "$expected_rc" -eq 0 ]] \
  || fail_rollback PREVIOUS_IMAGE_INSPECTION_FAILED 8
[[ -n "$running_image" && -n "$expected_image" && "$running_image" == "$expected_image" ]] \
  || fail_rollback PREVIOUS_IMAGE_MISMATCH 8

ln -sfn "$previous_target" "${current_symlink}.next"
mv -Tf "${current_symlink}.next" "$current_symlink"

echo "ROLLBACK_STATUS=PASS"
echo "ROLLBACK_TARGET=$previous_target"
echo "ROLLBACK_CONTAINER_ID=$container_id"
echo "ROLLBACK_IMAGE_REF=$previous_image_ref"
