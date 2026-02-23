#!/bin/bash
#
# PreToolUse hook: gh pr create / gh issue create のテンプレート準拠チェック
#
# Claude Codeのhookとして実行され、必須セクションが欠けていれば exit 2 でブロックする。
# テンプレートファイルから見出しを動的に抽出するため、テンプレート変更時にこのスクリプトの修正は不要。

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null)"
if [ -z "$REPO_ROOT" ]; then
  exit 0
fi

input=$(cat)
command=$(printf '%s' "$input" | jq -r '.tool_input.command // empty')

if [ -z "$command" ]; then
  exit 0
fi

# テンプレートファイルからMarkdown見出し行を抽出する
# 引数: $1 = テンプレートファイルパス, $2 = "yaml" (YAML front matterをスキップする場合)
extract_headings() {
  local template_file="$1"
  local has_frontmatter="$2"

  if [ "$has_frontmatter" = "yaml" ]; then
    awk '/^---$/{count++; next} count>=2' "$template_file" | grep -E '^#{1,2} '
  else
    grep -E '^#{1,2} ' "$template_file"
  fi
}

# bodyにすべての見出しが含まれているかチェックし、不足があればブロックする
# 引数: $1 = テンプレートファイルパス, $2 = "yaml" or "", $3 = エラーメッセージのラベル（"PR" or "Issue"）
validate_template() {
  local template_file="$1"
  local frontmatter="$2"
  local label="$3"

  if [ ! -f "$template_file" ]; then
    return 0
  fi

  local missing=()
  while IFS= read -r heading; do
    [ -z "$heading" ] && continue
    # 見出し行から # マーカーを除去してテキスト部分を取得
    local heading_text
    heading_text=$(printf '%s' "$heading" | sed 's/^#* //')
    if ! printf '%s' "$command" | grep -qF "$heading_text"; then
      missing+=("$heading")
    fi
  done < <(extract_headings "$template_file" "$frontmatter")

  if [ ${#missing[@]} -gt 0 ]; then
    {
      echo "${label}のbodyにテンプレートの必須セクションが含まれていません。"
      echo "不足しているセクション:"
      for section in "${missing[@]}"; do
        echo "  - $section"
      done
      echo ""
      echo "テンプレート内容:"
      if [ "$frontmatter" = "yaml" ]; then
        awk '/^---$/{count++; next} count>=2' "$template_file"
      else
        cat "$template_file"
      fi
    } >&2
    exit 2
  fi
}

# gh pr create のバリデーション
if printf '%s' "$command" | grep -q 'gh pr create'; then
  validate_template "$REPO_ROOT/.github/pull_request_template.md" "" "PR"
fi

# gh issue create のバリデーション
if printf '%s' "$command" | grep -q 'gh issue create'; then
  validate_template "$REPO_ROOT/.github/ISSUE_TEMPLATE/default.md" "yaml" "Issue"
fi

exit 0
