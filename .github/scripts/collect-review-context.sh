#!/usr/bin/env bash
set -euo pipefail

# document-reviewワークフロー用コンテキスト収集スクリプト
# 収集結果を$GITHUB_ENVにマルチライン環境変数として設定する

DELIMITER="EOF_$(head -c 8 /dev/urandom | od -An -tx1 | tr -d ' \n')"

# --- REVIEW_CHANGED_FILES ---
changed_files=$(git diff --name-only origin/main...HEAD)

{
  echo "REVIEW_CHANGED_FILES<<${DELIMITER}"
  echo "${changed_files}"
  echo "${DELIMITER}"
} >> "$GITHUB_ENV"

# --- REVIEW_DIFF ---
diff_output=$(git diff origin/main...HEAD)
diff_lines=$(echo "${diff_output}" | wc -l)

if [ "${diff_lines}" -gt 1500 ]; then
  echo "::error::差分が1500行を超えているため、document-reviewをスキップします（${diff_lines}行）"
  exit 1
fi

{
  echo "REVIEW_DIFF<<${DELIMITER}"
  echo "${diff_output}"
  echo "${DELIMITER}"
} >> "$GITHUB_ENV"

# --- REVIEW_DOCS ---
# 常時含めるドキュメント
always_docs=(
  "docs/architecture-decision-record/overview.md"
  "docs/project/overview.md"
)

docs_content=""

for doc in "${always_docs[@]}"; do
  if [ -f "${doc}" ]; then
    docs_content+="--- ${doc} ---"$'\n'
    docs_content+="$(cat "${doc}")"$'\n\n'
  fi
done

# 条件付きドキュメント: 変更パスから関連ドキュメントを特定して収集
# 実装コードが変更された場合、そのパッケージ/アプリのドキュメントを読み込む
declare -A collected_docs

while IFS= read -r file; do
  [ -z "${file}" ] && continue

  case "${file}" in
    # 変更されたドキュメント自体を含める
    docs/architecture-decision-record/*.md)
      collected_docs["${file}"]=1
      ;;
    docs/project/*)
      collected_docs["${file}"]=1
      ;;
    # packages配下の変更 → そのパッケージのCLAUDE.md/README.mdを含める
    packages/*)
      pkg_dir=$(echo "${file}" | grep -oE '^packages/[^/]+')
      for doc in "${pkg_dir}/CLAUDE.md" "${pkg_dir}/README.md"; do
        collected_docs["${doc}"]=1
      done
      ;;
    # apps配下の変更 → そのアプリのCLAUDE.mdを含める
    apps/*)
      app_dir=$(echo "${file}" | grep -oE '^apps/[^/]+')
      collected_docs["${app_dir}/CLAUDE.md"]=1
      ;;
  esac
done <<< "${changed_files}"

# 収集したドキュメントを読み込み（常時含めるドキュメントとの重複は除外）
for file in "${!collected_docs[@]}"; do
  # 常時含めるドキュメントはスキップ
  skip=false
  for always_doc in "${always_docs[@]}"; do
    if [ "${file}" = "${always_doc}" ]; then
      skip=true
      break
    fi
  done
  ${skip} && continue

  if [ -f "${file}" ]; then
    docs_content+="--- ${file} ---"$'\n'
    docs_content+="$(cat "${file}")"$'\n\n'
  fi
done

if [ -z "${docs_content}" ]; then
  docs_content="(関連ドキュメントが見つかりませんでした)"
fi

{
  echo "REVIEW_DOCS<<${DELIMITER}"
  echo "${docs_content}"
  echo "${DELIMITER}"
} >> "$GITHUB_ENV"

echo "コンテキスト収集完了"
echo "  変更ファイル数: $(echo "${changed_files}" | grep -c . || true)"
echo "  差分行数: ${diff_lines}"
