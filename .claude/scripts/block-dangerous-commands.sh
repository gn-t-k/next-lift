#!/bin/bash
#
# PreToolUse hook: 環境変数ダンプコマンドのブロック
#
# セキュリティ対策として、環境変数を一覧出力するコマンドの実行を防止する。
# export, env, printenv等のコマンドが検出された場合、exit 2でブロックする。

input=$(cat)
command=$(printf '%s' "$input" | jq -r '.tool_input.command // empty')

if [ -z "$command" ]; then
  exit 0
fi

DANGEROUS_PATTERNS=(
  '^\s*export\s*$'
  '^\s*env\s*$'
  '^\s*printenv'
  '^\s*set\s*$'
  '\bexport\s+-p\b'
  '\benv\b\s*\|'
  '\bprintenv\b\s*\|'
  'cat\s+/proc/[^/]*/environ'
  'strings\s+/proc/[^/]*/environ'
  '\bcompgen\s+-v\b'
)

for pattern in "${DANGEROUS_PATTERNS[@]}"; do
  if printf '%s' "$command" | grep -qE "$pattern"; then
    echo "環境変数を出力するコマンドの実行はセキュリティ上の理由でブロックされました。" >&2
    exit 2
  fi
done

exit 0
