#!/usr/bin/env bash
# Plugin hook: 前端 eslint --fix / 后端 Java 格式化
# CLAUDE_PROJECT_DIR = 消费项目（如 ses-web）；CLAUDE_PLUGIN_ROOT = 本插件目录

set -uo pipefail

PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
CACHE_DIR="$PROJECT_DIR/.claude/cache"
FRONT_CACHE="$CACHE_DIR/lint-front.txt"
JAVA_CACHE="$CACHE_DIR/lint-java.txt"
mkdir -p "$CACHE_DIR"

INPUT=$(cat)
EVENT=$(echo "$INPUT" | jq -r '.hook_event_name // empty')
case "$EVENT" in
  postToolUse) EVENT="PostToolUse" ;;
  postToolBatch) EVENT="PostToolBatch" ;;
  stop) EVENT="Stop" ;;
esac
HOOK_CWD=$(echo "$INPUT" | jq -r '.cwd // empty')

BACKEND_ROOT="${GUAVA_BACKEND_ROOT:-$PROJECT_DIR/../guava-admin}"
JAVA_FORMAT_MODE="${GUAVA_JAVA_FORMAT:-auto}" # auto | google-java-format | spotless | none

debug() {
  [[ "${GUAVA_LINT_DEBUG:-}" == "1" ]] || return 0
  echo "[lint-fix] $*" >&2
}

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

resolve_path() {
  local f="$1"
  [[ -n "$f" ]] || return 1
  if [[ "$f" != /* ]]; then
    if [[ -n "$HOOK_CWD" && -f "${HOOK_CWD%/}/$f" ]]; then
      f="${HOOK_CWD%/}/$f"
    elif [[ -f "$PROJECT_DIR/$f" ]]; then
      f="$PROJECT_DIR/$f"
    fi
  fi
  [[ -f "$f" ]] || return 1
  printf '%s\n' "$f"
}

record_file() {
  local f="$1"
  if is_front_file "$f"; then
    echo "$f" >> "$FRONT_CACHE"
  elif is_java_file "$f"; then
    echo "$f" >> "$JAVA_CACHE"
  fi
}

collect_post_tool_use_file() {
  echo "$INPUT" | jq -r '
    select(.tool_name == "Write" or .tool_name == "Edit" or .tool_name == "StrReplace")
    | .tool_input.file_path // .tool_input.path // empty
  '
}

collect_batch_files() {
  echo "$INPUT" | jq -r '
    .tool_calls[]?
    | select(.tool_name == "Write" or .tool_name == "Edit" or .tool_name == "StrReplace")
    | .tool_input.file_path // .tool_input.path // empty
  '
}

build_list() {
  local src="$1" dst="$2" kind="$3"
  : > "$dst"
  while IFS= read -r fp; do
    [[ -z "$fp" ]] && continue
    fp="$(resolve_path "$fp" || true)"
    [[ -z "$fp" ]] && continue
    if [[ "$kind" == "front" ]] && is_front_file "$fp"; then
      echo "$fp" >> "$dst"
    elif [[ "$kind" == "java" ]] && is_java_file "$fp"; then
      echo "$fp" >> "$dst"
    fi
  done < "$src"
  sort -u "$dst" -o "$dst"
}

setup_path() {
  export PATH="$PROJECT_DIR/node_modules/.bin:$PATH"
  if [[ -d "$HOME/.nvm/versions/node" ]]; then
    local latest_node
    latest_node="$(ls -1 "$HOME/.nvm/versions/node" 2>/dev/null | sort -V | tail -1 || true)"
    if [[ -n "$latest_node" ]]; then
      export PATH="$HOME/.nvm/versions/node/$latest_node/bin:$PATH"
    fi
  fi
}

run_eslint() {
  local -a args=("$@")
  setup_path
  cd "$PROJECT_DIR"
  if [[ -x "$PROJECT_DIR/node_modules/.bin/eslint" ]]; then
    "$PROJECT_DIR/node_modules/.bin/eslint" "${args[@]}"
    return $?
  fi
  if command -v pnpm >/dev/null 2>&1; then
    pnpm exec eslint "${args[@]}"
    return $?
  fi
  if command -v npx >/dev/null 2>&1; then
    npx eslint "${args[@]}"
    return $?
  fi
  debug "eslint not found in PATH or node_modules/.bin"
  return 127
}
run_eslint_fix() {
  local list="$1"
  local -a files=()
  [[ -s "$list" ]] || return 0
  while IFS= read -r f; do
    [[ -n "$f" ]] && files+=("$f")
  done < "$list"
  ((${#files[@]})) || return 0
  debug "eslint --fix ${files[*]}"
  run_eslint --cache --fix "${files[@]}" 2>&1 || true
}

run_eslint_check() {
  local list="$1"
  local -a files=()
  [[ -s "$list" ]] || return 0
  while IFS= read -r f; do
    [[ -n "$f" ]] && files+=("$f")
  done < "$list"
  ((${#files[@]})) || return 0
  local out
  if ! out=$(run_eslint "${files[@]}" 2>&1); then
    printf '%s\n' "$out"
    return 1
  fi
  return 0
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

emit_hook_context() {
  local event="$1" msg="$2"
  jq -nc --arg event "$event" --arg msg "$msg" \
    '{hookSpecificOutput: {hookEventName: $event, additionalContext: $msg}}'
}

emit_stop_block() {
  local reason="$1"
  jq -nc --arg reason "$reason" '{decision: "block", reason: $reason}'
}

lint_front_and_java() {
  local front_list="$1" java_list="$2"
  run_eslint_fix "$front_list"
  run_java_fix "$java_list"
}

collect_lint_errors() {
  local front_list="$1" java_list="$2"
  local err=""
  local out=""
  if ! out=$(run_eslint_check "$front_list" 2>&1); then
    err+="[Frontend ESLint]\n${out}\n"
  fi
  if ! out=$(run_java_check "$java_list" 2>&1); then
    err+="[Backend Java]\n${out}\n"
  fi
  printf '%b' "$err"
}

process_paths() {
  local raw_file="$1"
  local front_list="$2" java_list="$3"
  local resolved
  resolved=$(mktemp)
  while IFS= read -r fp; do
    [[ -z "$fp" ]] && continue
    fp="$(resolve_path "$fp" || true)"
    [[ -z "$fp" ]] && continue
    record_file "$fp"
    echo "$fp" >> "$resolved"
  done < "$raw_file"
  build_list "$resolved" "$front_list" front
  build_list "$resolved" "$java_list" java
  rm -f "$resolved"
}

handle_write_edit_lint() {
  local event="$1" front_list="$2" java_list="$3"
  lint_front_and_java "$front_list" "$java_list"
  local err
  err="$(collect_lint_errors "$front_list" "$java_list")"
  if [[ -n "$err" ]]; then
    if [[ "$event" == "Stop" ]]; then
      emit_stop_block "生成代码 ESLint/Java 校验未通过，请修复后再结束：${err}"
    else
      emit_hook_context "$event" "已运行 eslint --fix，仍有错误需修复：${err}"
    fi
    return 1
  fi
  return 0
}

if [[ "$EVENT" == "PostToolUse" ]]; then
  RAW=$(mktemp)
  FRONT_LIST=$(mktemp)
  JAVA_LIST=$(mktemp)
  trap 'rm -f "$RAW" "$FRONT_LIST" "$JAVA_LIST"' EXIT

  collect_post_tool_use_file | sort -u > "$RAW"
  if [[ -s "$RAW" ]]; then
    process_paths "$RAW" "$FRONT_LIST" "$JAVA_LIST"
    handle_write_edit_lint "PostToolUse" "$FRONT_LIST" "$JAVA_LIST" || true
  fi
  exit 0
fi

if [[ "$EVENT" == "PostToolBatch" ]]; then
  RAW=$(mktemp)
  FRONT_LIST=$(mktemp)
  JAVA_LIST=$(mktemp)
  trap 'rm -f "$RAW" "$FRONT_LIST" "$JAVA_LIST"' EXIT

  collect_batch_files | sort -u > "$RAW"
  if [[ -s "$RAW" ]]; then
    process_paths "$RAW" "$FRONT_LIST" "$JAVA_LIST"
    handle_write_edit_lint "PostToolBatch" "$FRONT_LIST" "$JAVA_LIST" || true
  fi
  exit 0
fi

if [[ "$EVENT" == "Stop" ]]; then
  FRONT_LIST=$(mktemp)
  JAVA_LIST=$(mktemp)
  trap 'rm -f "$FRONT_LIST" "$JAVA_LIST"' EXIT

  RAW=$(mktemp)
  trap 'rm -f "$FRONT_LIST" "$JAVA_LIST" "$RAW"' EXIT
  if [[ -f "$FRONT_CACHE" ]]; then
    cp "$FRONT_CACHE" "$RAW"
  else
    : > "$RAW"
  fi
  if [[ -f "$JAVA_CACHE" ]]; then
    cat "$JAVA_CACHE" >> "$RAW"
  fi

  build_list "$RAW" "$FRONT_LIST" front
  build_list "$RAW" "$JAVA_LIST" java

  if [[ ! -s "$FRONT_LIST" && ! -s "$JAVA_LIST" ]]; then
    exit 0
  fi

  if handle_write_edit_lint "Stop" "$FRONT_LIST" "$JAVA_LIST"; then
    : > "$FRONT_CACHE"
    : > "$JAVA_CACHE"
  fi
  exit 0
fi

exit 0
