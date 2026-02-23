---
name: issue
description: 会話中に問題やバグを発見した場合に使用する。コード調査、レビュー、CI分析などで見つかった問題をGitHub Issueとして記録することを提案する。明示的に呼び出してissueの一覧確認も可能。
---

# Issue管理スキル

GitHub Issueを使って問題を管理するスキル。

## いつ使うか

### 自動提案（作成）

以下のような場面で、「この問題をGitHub Issueとして記録しますか？」とユーザーに確認する:

- コードレビュー中に問題を発見した
- CI分析で修正が必要な問題を特定した
- リファクタリングの対象を見つけた
- テストが不足している箇所を見つけた
- 依存関係やパッケージ構成の問題を見つけた
- 技術的負債を発見した

### 明示的な呼び出し

`/issue` で呼び出された場合、ユーザーの意図に応じて作成または一覧確認を行う。

## issueの作成

### 1. ヒアリング

以下についてユーザーに確認（会話の中で既に出ていれば省略可）:

1. **対象領域**: どのパッケージ・ファイル・機能に関する問題か
2. **問題の内容**: 何が問題か
3. **修正内容**: どう修正すべきか（提案）
4. **優先度**: high / medium / low
5. **種別**: bugfix / refactor / improve / docs / infra / feature / chore
6. **検証方法**: 修正の検証方法

### 2. GitHub Issueの作成

以下のテンプレートで `gh issue create` を実行する。

**重要**: `.github/ISSUE_TEMPLATE/default.md` のテンプレートに必ず準拠すること。

**タイトル**: `{対象領域} — {概要}`

**本文**:

```markdown
## パッケージ / 対象

`@next-lift/{package-name}` または対象の記述

## 問題

{問題の説明}

## 修正内容

{修正の詳細}

## 対象ファイル

- `{path/to/file}`

## 検証方法

- {検証方法}
```

**ラベル**: 種別ラベル + 優先度ラベルの2つを付与する

- 種別: `bugfix` / `refactor` / `improve` / `docs` / `infra` / `feature` / `chore`
- 優先度: `priority:high` / `priority:medium` / `priority:low`

**コマンド例**:

```bash
gh issue create \
  --title "{対象領域} — {概要}" \
  --body "$(cat <<'EOF'
## パッケージ / 対象

...

## 問題

...

## 修正内容

...

## 対象ファイル

- ...

## 検証方法

- ...
EOF
)" \
  --label "{種別},{priority:優先度}"
```

### 3. 作成後

issueのURLをユーザーに提示する。

## issueの一覧確認

`gh issue list` でopen issueを表示する。

```bash
gh issue list --state open
```

## 注意事項

- すべて日本語で記述
- 既存のissueと重複しないか `gh issue list` で確認する
- 対象ファイルはリポジトリルートからの相対パスで記載
- 検証方法は具体的なコマンドを含める（可能な場合）
