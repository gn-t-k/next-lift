#!/bin/bash
#
# worktree 環境を検証コマンドが通る状態へ整える。
#
# 使い方:
#   bash .claude/scripts/setup-worktree.sh
#
# 動作:
#   1. pnpm install で依存をインストール
#   2. 親リポの env ファイル (.env / .env.local / .env.*.local) をコピー
#      → copy-worktree-env.sh を呼び出す
#   3. 親リポの .vercel/ ディレクトリ全体を worktree にコピー
#      → 親リポで vercel pull 済みの .env.preview.local / project.json をそのまま再利用
#   4. apps/web で next typegen を実行
#      → typed routes が生成する LayoutProps / PageProps の型を .next/types に出力
#
# 前提:
#   - 親リポで `npx vercel pull --yes --environment=preview` 済みであること
#     (`.vercel/.env.preview.local` が親リポに存在する)
#     無い場合は .vercel コピーと typegen をスキップし、install と env コピーまで実行する
#
# 安全策:
#   - 親リポと現在のworktreeが同一ディレクトリの場合は何もしない
#
# 完了マーカー:
#   - 最終行に "=== SETUP DONE ===" を出力する（バックグラウンド実行時の完了判定に使う）

set -euo pipefail

current_root=$(git rev-parse --show-toplevel)
common_dir=$(git rev-parse --git-common-dir)
parent_root=$(cd "$(dirname "$common_dir")" && pwd)

if [ "$current_root" = "$parent_root" ]; then
  echo "現在のディレクトリは親リポジトリです。worktree でのみ実行してください。" >&2
  exit 1
fi

script_dir=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)

echo "==> 1/4 pnpm install"
# hook 経由のバックグラウンド実行(TTYなし)でも node_modules 再作成が止まらないようにする
pnpm install --prefer-offline --config.confirmModulesPurge=false
echo

echo "==> 2/4 env ファイルをコピー"
bash "${script_dir}/copy-worktree-env.sh"
echo

echo "==> 3/4 .vercel/ をコピー"
parent_vercel="${parent_root}/.vercel"
dest_vercel="${current_root}/.vercel"
if [ ! -f "${parent_vercel}/.env.preview.local" ]; then
  echo "親リポに .vercel/.env.preview.local が無いため .vercel コピーと typegen をスキップ。" >&2
  echo "型生成が必要なら親リポで 'npx vercel pull --yes --environment=preview' 後に再実行する。" >&2
  echo
  echo "=== SETUP DONE ==="
  exit 0
fi
mkdir -p "$dest_vercel"
cp -R "${parent_vercel}/." "${dest_vercel}/"
echo "copy: .vercel/ → ${dest_vercel}"
echo

echo "==> 4/4 next typegen で .next/types を生成"
set -a
# shellcheck disable=SC1091
source "${dest_vercel}/.env.preview.local"
set +a
export APP_ENV="${APP_ENV:-development-worktree}"
pnpm --filter @next-lift/web exec next typegen
echo

echo "完了: pnpm type-check / pnpm test を実行できる状態です。"
echo "=== SETUP DONE ==="
