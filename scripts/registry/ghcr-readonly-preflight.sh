#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'
umask 077

reference="${1:?candidate reference required}"
workdir="${2:?work directory required}"
output_file="${3:?GitHub output file required}"

reference_pattern='^ghcr\.io/appolon1908-hue/codestra(:[A-Za-z0-9_][A-Za-z0-9._-]{0,127}|@sha256:[0-9a-f]{64})$'
digest_pattern='^sha256:[0-9a-f]{64}$'

write_output() {
  local key="$1"
  local value="$2"
  printf '%s=%s\n' "$key" "$value" >> "$output_file"
}

write_defaults() {
  write_output package_access ERROR
  write_output resolved_digest UNAVAILABLE
  write_output manifest_media_type UNAVAILABLE
  write_output supported_platforms UNAVAILABLE
  write_output digest_validation NOT_RUN
}

write_defaults

[[ "$reference" =~ $reference_pattern ]] || exit 10

install -m 700 -d "$workdir"
inspect_stdout="$workdir/imagetools.stdout"
inspect_stderr="$workdir/imagetools.stderr"

set +e
docker buildx imagetools inspect "$reference" >"$inspect_stdout" 2>"$inspect_stderr"
inspect_rc=$?
set -e

if [[ "$inspect_rc" -ne 0 ]]; then
  if grep -Eqi 'manifest unknown|name unknown|not found' "$inspect_stderr"; then
    write_output package_access NOT_FOUND
  elif grep -Eqi 'denied|unauthorized|authentication required|insufficient[_ -]?scope|forbidden' "$inspect_stderr"; then
    write_output package_access DENIED
  else
    write_output package_access ERROR
  fi
  exit 20
fi

resolved_digest="$(awk '/^Digest:[[:space:]]*/ {print $2; exit}' "$inspect_stdout")"
manifest_media_type="$(awk '/^MediaType:[[:space:]]*/ {print $2; exit}' "$inspect_stdout")"
supported_platforms="$(
  awk '/^[[:space:]]*Platform:[[:space:]]*/ {print $2}' "$inspect_stdout" |
    grep -E '^[A-Za-z0-9_.+-]+/[A-Za-z0-9_.+-]+([/][A-Za-z0-9_.+-]+)?$' |
    sort -u |
    paste -sd, -
)"

[[ "$resolved_digest" =~ $digest_pattern ]] || {
  write_output package_access PASS
  write_output digest_validation FAIL
  exit 21
}

if [[ -z "$manifest_media_type" || ! "$manifest_media_type" =~ ^application/[A-Za-z0-9.+_-]+$ ]]; then
  manifest_media_type="UNAVAILABLE"
fi

if [[ -z "$supported_platforms" ]]; then
  supported_platforms="UNAVAILABLE"
fi

if [[ "$reference" == *@sha256:* ]]; then
  requested_digest="${reference##*@}"
  if [[ "$requested_digest" != "$resolved_digest" ]]; then
    write_output package_access PASS
    write_output resolved_digest "$resolved_digest"
    write_output manifest_media_type "$manifest_media_type"
    write_output supported_platforms "$supported_platforms"
    write_output digest_validation FAIL
    exit 22
  fi
fi

write_output package_access PASS
write_output resolved_digest "$resolved_digest"
write_output manifest_media_type "$manifest_media_type"
write_output supported_platforms "$supported_platforms"
write_output digest_validation PASS
