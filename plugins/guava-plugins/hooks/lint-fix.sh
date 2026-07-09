#!/usr/bin/env bash
# Plugin hook: 前端 eslint --fix / 后端 Java 格式化
# CLAUDE_PROJECT_DIR = 消费项目（如 ses-web）；CLAUDE_PLUGIN_ROOT = 本插件目录

set -euo pipefail

PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
CACHE_DIR="$PROJECT_DIR/.claude/cache"
FRONT_CACHE="$CACHE_DIR/lint-front.txt"
JAVA_CACHE="$CACHE_DIR/lint-java.txt"
mkdir -p "$CACHE_DIR"

INPUT=$(cat)
EVENT=$(echo "$INPUT" | jq -r '.hook_event_name // empty')

BACKEND_ROOT="${GUAVA_BACKEND_ROOT:-$PROJECT_DIR/../guava-admin}"
JAVA_FORMAT_MODE="${GUAVA_JAVA_FORMAT:-auto}" # auto | google-java-format | spotless | none

is_front_file() {
  local f="$1"
  [[ -n "$f" && -f "$f" ]] || return 1
  [[ "$f" == *node_modules* ]] && return 1
  case "$f" in
    *.ts | *.tsx | *.vue | *.js | *.jsx | *.mjs | *.cjs) return 0 ;;
    *) return 1 ;;
  esac
}

is_java_file() {
  local f="$1"
  [[ -n "$f" && -f "$f" && "$f" == *.java ]] || return 1
  [[ "$f" == *node_modules* ]] && return 1
  return 0
}

collect_batch_files() {
  echo "$INPUT" | jq -r '
    .tool_calls[]?
    | select(.tool_name == "Write" or .tool_name == "Edit")
    | .tool_input.file_path // empty
  '
}

record_file() {
  local f="$1"
  if is_front_file "$f"; then
    echo "$f" >> "$FRONT_CACHE"
  elif is_java_file "$f"; then
    echo "$f" >> "$JAVA_CACHE"
  fi
}

build_list() {
  local src="$1" dst="$2" kind="$3"
  : > "$dst"
  while IFS= read -r fp; do
    [[ -z "$fp" ]] && continue
    if [[ "$kind" == "front" ]] && is_front_file "$fp"; then
      echo "$fp" >> "$dst"
    elif [[ "$kind" == "java" ]] && is_java_file "$fp"; then
      echo "$fp" >> "$dst"
    fi
  done < "$src"
  sort -u "$dst" -o "$dst"
}

run_eslint_fix() {
  local list="$1"
  [[ -s "$list" ]] || return 0
  cd "$PROJECT_DIR"
  while IFS= read -r f; do
    [[ -n "$f" ]] && pnpm exec eslint --fix "$f"
  done < "$list"
}

run_eslint_check() {
  local list="$1"
  [[ -s "$list" ]] || return 0
  cd "$PROJECT_DIR"
  while IFS= read -r f; do
    [[ -n "$f" ]] && pnpm exec eslint "$f"
  done < "$list"
}

find_pom() {
  local dir="$1"
  while [[ "$dir" == "$BACKEND_ROOT"* || "$dir" == "$PROJECT_DIR"* ]]; do
    if [[ -f "$dir/pom.xml" ]]; then
      echo "$dir/pom.xml"
      return 0
    fi
    [[ "$dir" == "/" ]] && break
    dir="$(dirname "$dir")"
  done
  return 1
}

format_java_file() {
  local f="$1"
  [[ -f "$f" ]] || return 0

  if [[ "$JAVA_FORMAT_MODE" == "none" ]]; then
    return 0
  fi

  if [[ "$JAVA_FORMAT_MODE" == "google-java-format" || "$JAVA_FORMAT_MODE" == "auto" ]]; then
    if command -v google-java-format >/dev/null 2>&1; then
      google-java-format -i "$f"
      return 0
    fi
  fi

  if [[ "$JAVA_FORMAT_MODE" == "spotless" || "$JAVA_FORMAT_MODE" == "auto" ]]; then
    local pom
    pom="$(find_pom "$(dirname "$f")" || true)"
    if [[ -n "$pom" ]] && command -v mvn >/dev/null 2>&1; then
      (cd "$(dirname "$pom")" && mvn -q spotless:apply -DspotlessFiles="$f" 2>/dev/null) && return 0
      (cd "$(dirname "$pom")" && mvn -q spotless:apply 2>/dev/null) && return 0
    fi
  fi

  if [[ -n "${GUAVA_JAVA_FORMAT_CMD:-}" ]]; then
    # shellcheck disable=SC2086
    eval "${GUAVA_JAVA_FORMAT_CMD//\{file\}/$f}"
    return 0
  fi

  return 0
}

check_java_file() {
  local f="$1"
  [[ -f "$f" ]] || return 0

  if command -v google-java-format >/dev/null 2>&1; then
    if ! google-java-format --dry-run --set-exit-if-changed "$f" >/dev/null 2>&1; then
      return 1
    fi
  fi

  local pom
  pom="$(find_pom "$(dirname "$f")" || true)"
  if [[ -n "$pom" ]] && command -v mvn >/dev/null 2>&1; then
    if ! (cd "$(dirname "$pom")" && mvn -q -DskipTests compile 2>/dev/null); then
      return 1
    fi
  fi
  return 0
}

run_java_fix() {
  local list="$1"
  [[ -s "$list" ]] || return 0
  while IFS= read -r f; do
    [[ -n "$f" ]] && format_java_file "$f" || true
  done < "$list"
}

run_java_check() {
  local list="$1"
  [[ -s "$list" ]] || return 0
  local err=""
  while IFS= read -r f; do
    [[ -z "$f" ]] && continue
    if ! out=$(check_java_file "$f" 2>&1); then
      err+="${f}: ${out:-format/compile check failed}\n"
    fi
  done < "$list"
  [[ -z "$err" ]] || { echo -e "$err"; return 1; }
}

emit_context() {
  local event="$1" msg="$2"
  jq -nc --arg event "$event" --arg msg "$msg" \
    '{hookSpecificOutput: {hookEventName: $event, additionalContext: $msg}}'
}

if [[ "$EVENT" == "PostToolBatch" ]]; then
  BATCH_RAW=$(mktemp)
  FRONT_LIST=$(mktemp)
  JAVA_LIST=$(mktemp)
  trap 'rm -f "$BATCH_RAW" "$FRONT_LIST" "$JAVA_LIST"' EXIT

  collect_batch_files | sort -u > "$BATCH_RAW"
  while IFS= read -r fp; do
    [[ -n "$fp" ]] && record_file "$fp"
  done < "$BATCH_RAW"

  build_list "$BATCH_RAW" "$FRONT_LIST" front
  build_list "$BATCH_RAW" "$JAVA_LIST" java

  run_eslint_fix "$FRONT_LIST" || true
  run_java_fix "$JAVA_LIST" || true
  exit 0
fi

if [[ "$EVENT" == "Stop" ]]; then
  FRONT_LIST=$(mktemp)
  JAVA_LIST=$(mktemp)
  trap 'rm -f "$FRONT_LIST" "$JAVA_LIST"' EXIT

  [[ -f "$FRONT_CACHE" ]] && build_list "$FRONT_CACHE" "$FRONT_LIST" front && : > "$FRONT_CACHE"
  [[ -f "$JAVA_CACHE" ]] && build_list "$JAVA_CACHE" "$JAVA_LIST" java && : > "$JAVA_CACHE"

  ERR=""
  if ! out=$(run_eslint_check "$FRONT_LIST" 2>&1); then
    ERR+="[Frontend ESLint]\n${out}\n"
  fi
  if ! out=$(run_java_check "$JAVA_LIST" 2>&1); then
    ERR+="[Backend Java]\n${out}\n"
  fi

  if [[ -n "$ERR" ]]; then
    emit_context "Stop" "Lint 校验未通过（已尝试自动修复），请修复后再结束：${ERR}"
  fi
  exit 0
fi

exit 0
