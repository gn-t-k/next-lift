#!/bin/bash
#
# worktree 用に親リポジトリの env ファイルを現在のworktreeへコピーする。
#
# 使い方:
#   bash .claude/scripts/copy-worktree-env.sh
#
# 動作:
#   1. `git rev-parse --git-common-dir` で親リポの .git を解決
#   2. 親リポの worktree ルート配下から、gitignore 対象の env ファイル
#      (.env / .env.local / .env.*.local) を列挙
#   3. 同じ相対パスで現在の worktree にコピー
#
# 安全策:
#   - 親リポと現在のworktreeが同一ディレクトリの場合は何もしない
#   - 上書き前に既存ファイルとの差分有無を表示し、差分がある場合のみコピー

set -euo pipefail

current_root=$(git rev-parse --show-toplevel)
common_dir=$(git rev-parse --git-common-dir)
parent_root=$(cd "$(dirname "$common_dir")" && pwd)

if [ "$current_root" = "$parent_root" ]; then
  echo "現在のディレクトリは親リポジトリです。worktree でのみ実行してください。" >&2
  exit 1
fi

echo "親リポジトリ: $parent_root"
echo "worktree   : $current_root"
echo

env_patterns=(
  ".env"
  ".env.local"
  ".env.development.local"
  ".env.test.local"
  ".env.production.local"
)

copied=0
skipped=0

while IFS= read -r -d '' file; do
  rel="${file#${parent_root}/}"
  dest="${current_root}/${rel}"

  for pattern in "${env_patterns[@]}"; do
    if [ "$(basename "$file")" = "$pattern" ]; then
      mkdir -p "$(dirname "$dest")"
      if [ -f "$dest" ] && cmp -s "$file" "$dest"; then
        echo "skip: $rel (一致)"
        skipped=$((skipped + 1))
      else
        cp "$file" "$dest"
        echo "copy: $rel"
        copied=$((copied + 1))
      fi
      break
    fi
  done
done < <(find "$parent_root" \
  -type d \( -name node_modules -o -name .git -o -name .next -o -name .turbo -o -name dist -o -name build -o -name .vercel \) -prune \
  -o -type f \( -name ".env" -o -name ".env.local" -o -name ".env.*.local" \) -print0)

echo
echo "完了: コピー ${copied} 件 / スキップ ${skipped} 件"
