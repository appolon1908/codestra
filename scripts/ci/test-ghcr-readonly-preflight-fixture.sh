#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'
umask 077

repository_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
fixture_root="$(mktemp -d)"
trap 'rm -rf "$fixture_root"' EXIT

mock_bin="$fixture_root/bin"
mkdir -p "$mock_bin"

cat > "$mock_bin/docker" <<'MOCK'
#!/usr/bin/env bash
set -Eeuo pipefail

[[ "${1:-}" == "buildx" ]] || exit 90
[[ "${2:-}" == "imagetools" ]] || exit 91
[[ "${3:-}" == "inspect" ]] || exit 92
reference="${4:-}"

case "${MOCK_INSPECT_MODE:-success}" in
  success)
    cat <<EOF
Name:      ${reference}
MediaType: application/vnd.oci.image.index.v1+json
Digest:    sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
Manifests:
  Name:      ${reference}@sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
  MediaType: application/vnd.oci.image.manifest.v1+json
  Platform:  linux/amd64
  Name:      ${reference}@sha256:cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
  MediaType: application/vnd.oci.image.manifest.v1+json
  Platform:  linux/arm64
EOF
    ;;
  no_platform)
    cat <<EOF
Name:      ${reference}
MediaType: application/vnd.oci.image.manifest.v1+json
Digest:    sha256:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
EOF
    ;;
  not_found)
    printf 'manifest unknown: not found\n' >&2
    exit 1
    ;;
  denied)
    printf 'denied: insufficient_scope\n' >&2
    exit 1
    ;;
  invalid_digest)
    cat <<EOF
Name:      ${reference}
MediaType: application/vnd.oci.image.index.v1+json
Digest:    mutable-tag
Platform:  linux/amd64
EOF
    ;;
  digest_mismatch)
    cat <<EOF
Name:      ${reference}
MediaType: application/vnd.oci.image.manifest.v1+json
Digest:    sha256:dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd
Platform:  linux/amd64
EOF
    ;;
  *)
    exit 99
    ;;
esac
MOCK

chmod 0755 "$mock_bin/docker"
helper="$repository_root/scripts/registry/ghcr-readonly-preflight.sh"

run_case() {
  local mode="$1"
  local reference="$2"
  local expected_access="$3"
  local expected_validation="$4"
  local expected_rc="$5"
  local case_root="$fixture_root/$mode"
  local output_file="$case_root/output.txt"

  mkdir -p "$case_root"

  set +e
  PATH="$mock_bin:$PATH" MOCK_INSPECT_MODE="$mode" \
    bash "$helper" "$reference" "$case_root/work" "$output_file"
  rc=$?
  set -e

  [[ "$rc" -eq "$expected_rc" ]]
  grep -Fx "package_access=$expected_access" "$output_file"
  grep -Fx "digest_validation=$expected_validation" "$output_file"
}

run_case \
  success \
  ghcr.io/appolon1908-hue/codestra:fixture \
  PASS \
  PASS \
  0

grep -Fx \
  'resolved_digest=sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' \
  "$fixture_root/success/output.txt"
grep -Fx \
  'manifest_media_type=application/vnd.oci.image.index.v1+json' \
  "$fixture_root/success/output.txt"
grep -Fx \
  'supported_platforms=linux/amd64,linux/arm64' \
  "$fixture_root/success/output.txt"

run_case \
  no_platform \
  ghcr.io/appolon1908-hue/codestra:single-platform \
  PASS \
  PASS \
  0

grep -Fx \
  'resolved_digest=sha256:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff' \
  "$fixture_root/no_platform/output.txt"
grep -Fx \
  'manifest_media_type=application/vnd.oci.image.manifest.v1+json' \
  "$fixture_root/no_platform/output.txt"
grep -Fx \
  'supported_platforms=UNAVAILABLE' \
  "$fixture_root/no_platform/output.txt"

run_case \
  not_found \
  ghcr.io/appolon1908-hue/codestra:missing \
  NOT_FOUND \
  NOT_RUN \
  20

run_case \
  denied \
  ghcr.io/appolon1908-hue/codestra:private \
  DENIED \
  NOT_RUN \
  20

run_case \
  invalid_digest \
  ghcr.io/appolon1908-hue/codestra:bad-digest \
  PASS \
  FAIL \
  21

run_case \
  digest_mismatch \
  ghcr.io/appolon1908-hue/codestra@sha256:eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee \
  PASS \
  FAIL \
  22

invalid_root="$fixture_root/invalid-reference"
mkdir -p "$invalid_root"
set +e
PATH="$mock_bin:$PATH" MOCK_INSPECT_MODE=success \
  bash "$helper" \
    'docker.io/another/repository:latest' \
    "$invalid_root/work" \
    "$invalid_root/output.txt"
invalid_rc=$?
set -e
[[ "$invalid_rc" -eq 10 ]]

if grep -R -E 'token|authorization|password|secret' "$fixture_root"/*.txt "$fixture_root"/*/output.txt 2>/dev/null; then
  echo 'Fixture evidence contains a forbidden credential marker.' >&2
  exit 1
fi

printf 'GHCR read-only preflight fixtures passed.\n'
