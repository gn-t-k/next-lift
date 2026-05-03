#!/bin/bash
#
# PreToolUse hook: ブランチ名のCIルール準拠チェック
#
# git checkout -b / git switch -c を検出し、ブランチ名を
# .github/workflows/consistent-pull-request.yml の head branch ルールで検証する。
# ワークフローファイルを Single Source of Truth として参照するため、ルールの二重管理が不要。

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null)"
if [ -z "$REPO_ROOT" ]; then
  exit 0
fi

input=$(cat)
command=$(printf '%s' "$input" | jq -r '.tool_input.command // empty')

if [ -z "$command" ]; then
  exit 0
fi

# git checkout -b <branch> または git switch -c <branch> のブランチ名を取得
branch=""

if printf '%s' "$command" | grep -qE '\bgit[[:space:]]+checkout\b' && \
   printf '%s' "$command" | grep -qE '[[:space:]]-b[[:space:]]'; then
  branch=$(printf '%s' "$command" | sed -E 's/.*[[:space:]]-b[[:space:]]+([^[:space:]]+).*/\1/')
elif printf '%s' "$command" | grep -qE '\bgit[[:space:]]+switch\b' && \
     printf '%s' "$command" | grep -qE '[[:space:]]-c[[:space:]]'; then
  branch=$(printf '%s' "$command" | sed -E 's/.*[[:space:]]-c[[:space:]]+([^[:space:]]+).*/\1/')
fi

# ブランチ作成コマンドでなければスキップ
if [ -z "$branch" ]; then
  exit 0
fi

WORKFLOW_FILE="$REPO_ROOT/.github/workflows/consistent-pull-request.yml"
if [ ! -f "$WORKFLOW_FILE" ]; then
  exit 0
fi

# check-head-branch-name ステップの rules を抽出（スペース区切りのパターン一覧）
rules_line=$(awk '
  /id: check-head-branch-name/ { found = 1 }
  found && /rules:/ { capture = 1; next }
  capture { print; exit }
' "$WORKFLOW_FILE" | xargs)

if [ -z "$rules_line" ]; then
  exit 0
fi

# glob パターンを正規表現に変換する
# CI で使用される action-restrict-head-branch は minimatch 系の semantics を持つ。
# - **/ は 0 個以上のセグメント（例: feature/**/* は feature/x も feature/x/y も許可）
# - * は / を含まない 1 文字以上にマッチ
glob_to_regex() {
  local pattern="$1"
  local regex=""
  local i=0
  local len=${#pattern}
  while [ $i -lt $len ]; do
    local ch3="${pattern:$i:3}"
    local ch2="${pattern:$i:2}"
    local ch="${pattern:$i:1}"
    if [ "$ch3" = "**/" ]; then
      regex="${regex}([^/]+/)*"
      i=$((i + 3))
    elif [ "$ch2" = "**" ]; then
      regex="${regex}.+"
      i=$((i + 2))
    elif [ "$ch" = "*" ]; then
      regex="${regex}[^/]+"
      i=$((i + 1))
    elif [ "$ch" = "." ]; then
      regex="${regex}\\."
      i=$((i + 1))
    else
      regex="${regex}${ch}"
      i=$((i + 1))
    fi
  done
  printf '^%s$' "$regex"
}

# パターン文字列を shell の glob 展開から保護したうえで配列化する
set -f
# shellcheck disable=SC2206
patterns=($rules_line)
set +f

# いずれかのパターンにマッチするか確認
matched=false
for pattern in "${patterns[@]}"; do
  regex=$(glob_to_regex "$pattern")
  if printf '%s' "$branch" | grep -qE "$regex"; then
    matched=true
    break
  fi
done

if [ "$matched" = false ]; then
  {
    echo "ブランチ名 '$branch' はCIのルールに違反しています。"
    echo ""
    echo "許可されているパターン:"
    for pattern in "${patterns[@]}"; do
      echo "  - $pattern"
    done
    echo ""
    echo "例: feature/your-name/description, bugfix/your-name/issue-id"
  } >&2
  exit 2
fi

exit 0
