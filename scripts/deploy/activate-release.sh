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
image_ref="${8:?image_ref is required}"
release_sha="${9:?release_sha is required}"
ghcr_user="${10:?ghcr_user is required}"
staging_dir="${11:?staging_dir is required}"

safe_path='^/[A-Za-z0-9._/-]+$'
safe_name='^[A-Za-z0-9][A-Za-z0-9_.-]*$'
safe_port='^[0-9]{4,5}$'
safe_sha='^[a-f0-9]{40}$'
safe_image='^ghcr\.io/[a-z0-9_.-]+/[a-z0-9_.-]+@sha256:[a-f0-9]{64}$'
safe_health='^/[A-Za-z0-9._~!$&()*+,;=:@%/-]*$'

for value in "$release_root" "$releases_dir" "$current_symlink" "$staging_dir"; do
  [[ "$value" =~ $safe_path ]] || { echo "ERROR=UNSAFE_PATH"; exit 2; }
  [[ "$value" != *".."* && "$value" != *"//"* ]] || { echo "ERROR=UNSAFE_PATH"; exit 2; }
done

[[ "$release_root" =~ ^/(srv|opt|data|mnt/[A-Za-z0-9._-]+|var/(lib|www)|home/[A-Za-z0-9._-]+)/[A-Za-z0-9._/-]+$ ]] \
  || { echo "ERROR=RELEASE_ROOT_NOT_DEDICATED"; exit 2; }
[[ "$releases_dir" == "$release_root"/* ]] || { echo "ERROR=RELEASES_DIR_OUTSIDE_ROOT"; exit 2; }
[[ "$current_symlink" == "$release_root"/* ]] || { echo "ERROR=CURRENT_LINK_OUTSIDE_ROOT"; exit 2; }
[[ "$current_symlink" != "$releases_dir" && "$current_symlink" != "$releases_dir"/* ]] \
  || { echo "ERROR=CURRENT_LINK_INSIDE_RELEASES_DIR"; exit 2; }
[[ "$staging_dir" == "$release_root/.incoming/"* ]] \
  || { echo "ERROR=STAGING_OUTSIDE_INCOMING_DIR"; exit 2; }
[[ "$compose_project" =~ $safe_name ]] || { echo "ERROR=UNSAFE_PROJECT"; exit 2; }
[[ "$service_name" =~ $safe_name ]] || { echo "ERROR=UNSAFE_SERVICE"; exit 2; }
[[ "$loopback_port" =~ $safe_port ]] || { echo "ERROR=UNSAFE_PORT"; exit 2; }
[[ "$health_path" =~ $safe_health ]] || { echo "ERROR=UNSAFE_HEALTH_PATH"; exit 2; }
[[ "$image_ref" =~ $safe_image ]] || { echo "ERROR=IMAGE_MUST_USE_GHCR_DIGEST"; exit 2; }
[[ "$release_sha" =~ $safe_sha ]] || { echo "ERROR=SOURCE_SHA_MUST_BE_FULL"; exit 2; }
[[ "$ghcr_user" =~ $safe_name ]] || { echo "ERROR=UNSAFE_GHCR_USER"; exit 2; }

[[ -d "$release_root" && -d "$releases_dir" ]] \
  || { echo "ERROR=VERIFIED_RUNTIME_PATH_MISSING"; exit 3; }
for file in \
  compose.production.yaml \
  activate-release.sh \
  rollback-release.sh \
  staging-checksums.txt; do
  [[ -f "$staging_dir/$file" ]] || { echo "ERROR=STAGED_FILE_MISSING:$file"; exit 3; }
done
(
  cd "$staging_dir"
  sha256sum --check --strict staging-checksums.txt
) || { echo "ERROR=STAGED_CHECKSUM_MISMATCH"; exit 3; }

command -v docker >/dev/null 2>&1 || { echo "ERROR=DOCKER_MISSING"; exit 3; }
docker compose version >/dev/null 2>&1 || { echo "ERROR=DOCKER_COMPOSE_MISSING"; exit 3; }
command -v flock >/dev/null 2>&1 || { echo "ERROR=FLOCK_MISSING"; exit 3; }
command -v curl >/dev/null 2>&1 || { echo "ERROR=CURL_MISSING"; exit 3; }

[[ -L "$current_symlink" ]] || { echo "ERROR=ROLLBACK_BASELINE_LINK_REQUIRED"; exit 3; }
previous_target="$(readlink -f "$current_symlink" || true)"
[[ -n "$previous_target" ]] || { echo "ERROR=ROLLBACK_BASELINE_UNRESOLVED"; exit 3; }
[[ "$previous_target" == "$releases_dir"/* ]] \
  || { echo "ERROR=CURRENT_TARGET_OUTSIDE_RELEASES_DIR"; exit 3; }
[[ -f "$previous_target/compose.yaml" && -f "$previous_target/.env" ]] \
  || { echo "ERROR=ROLLBACK_BASELINE_INCOMPLETE"; exit 3; }

release_id="${release_sha}-$(date -u +%Y%m%dT%H%M%SZ)"
release_dir="${releases_dir}/${release_id}"

exec 9>"${release_root}/.deploy.lock"
flock -n 9 || { echo "ERROR=DEPLOYMENT_ALREADY_RUNNING"; exit 4; }

auth_dir="$(mktemp -d "${release_root}/.docker-auth.XXXXXX")"
cleanup() {
  docker --config "$auth_dir" logout ghcr.io >/dev/null 2>&1 || true
  rm -rf "$auth_dir"
  rm -rf "$staging_dir"
}
trap cleanup EXIT

IFS= read -r ghcr_token
[[ -n "$ghcr_token" ]] || { echo "ERROR=EMPTY_GHCR_TOKEN"; exit 5; }
printf '%s' "$ghcr_token" \
  | docker --config "$auth_dir" login ghcr.io -u "$ghcr_user" --password-stdin >/dev/null
unset ghcr_token

install -d -m 0750 "$release_dir"
install -m 0640 "$staging_dir/compose.production.yaml" "$release_dir/compose.yaml"
install -m 0750 "$staging_dir/rollback-release.sh" "$release_dir/rollback-release.sh"
printf '%s\n' "$previous_target" > "$release_dir/.previous-release"
chmod 0600 "$release_dir/.previous-release"

cat > "$release_dir/.env" <<EOF
COMPOSE_PROJECT_NAME=${compose_project}
IMAGE_REF=${image_ref}
WEB_PORT=${loopback_port}
RELEASE_SHA=${release_sha}
EOF
chmod 0600 "$release_dir/.env"

docker --config "$auth_dir" pull "$image_ref"
docker compose \
  --env-file "$release_dir/.env" \
  --project-name "$compose_project" \
  --file "$release_dir/compose.yaml" \
  config --quiet

rollback() {
  local exit_code="$1"
  echo "ACTIVATION_FAILED=$exit_code"
  if CODESTRA_DEPLOY_LOCK_HELD=1 bash "$release_dir/rollback-release.sh" \
    "$release_root" \
    "$releases_dir" \
    "$current_symlink" \
    "$compose_project" \
    "$service_name" \
    "$loopback_port" \
    "$health_path" \
    "$release_dir"; then
    echo "ACTIVATION_ROLLBACK=PASS"
  else
    echo "ACTIVATION_ROLLBACK=FAILED"
  fi
  exit "$exit_code"
}

set +e
docker compose \
  --env-file "$release_dir/.env" \
  --project-name "$compose_project" \
  --file "$release_dir/compose.yaml" \
  up -d --no-build --pull never --wait
activation_rc=$?
set -e
[[ "$activation_rc" -eq 0 ]] || rollback "$activation_rc"

for attempt in 1 2 3 4 5 6; do
  if curl --fail --silent --show-error \
    "http://127.0.0.1:${loopback_port}${health_path}" >/dev/null; then
    break
  fi
  [[ "$attempt" -lt 6 ]] || rollback 6
  sleep 5
done

set +e
container_id="$(
  docker compose \
    --env-file "$release_dir/.env" \
    --project-name "$compose_project" \
    --file "$release_dir/compose.yaml" \
    ps --quiet "$service_name"
)"
ps_rc=$?
set -e
[[ "$ps_rc" -eq 0 && -n "$container_id" ]] || rollback 7

set +e
running_image="$(docker inspect --format '{{.Image}}' "$container_id")"
running_rc=$?
expected_image="$(docker image inspect --format '{{.Id}}' "$image_ref")"
expected_rc=$?
set -e
[[ "$running_rc" -eq 0 && "$expected_rc" -eq 0 ]] || rollback 8
[[ -n "$running_image" && -n "$expected_image" ]] || rollback 8
[[ "$running_image" == "$expected_image" ]] || rollback 8

ln -sfn "$release_dir" "${current_symlink}.next"
mv -Tf "${current_symlink}.next" "$current_symlink"

echo "ACTIVATION_STATUS=PASS"
echo "RELEASE_DIR=$release_dir"
echo "SOURCE_SHA=$release_sha"
echo "IMAGE_REF=$image_ref"
echo "CONTAINER_ID=$container_id"
echo "ROLLBACK_TARGET=$previous_target"
