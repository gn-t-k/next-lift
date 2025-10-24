# CLAUDE.md

このファイルは、このリポジトリで作業する際にClaude Code (claude.ai/code) に対して提供するガイダンスです。

## 言語設定

- ユーザーへの応答は日本語で行う

## 関連ドキュメント

- @docs/project/overview.md : プロジェクト概要、機能、開発状況
- @docs/architecture-decision-record/overview.md : システムアーキテクチャと設計原則
- @docs/model-based-ui-design/ : UI設計仕様（ユースケース、タスク分析、コンセプト定義）

## 開発ノート

- コードコメントは日本語で記述する（ただし、コードから読み取れない内容のみ）

## Gitワークフロー

- プルリクエストごとに新しいブランチを作成する
- ブランチ命名規則: `<type>/<description>` ( @.github/workflows/consistent-pull-request.yml 参照 )
- mainブランチへの直接コミットは禁止
- ブランチはPRマージ後に自動削除される（GitHubで設定済み）
- PR作成時は `.github/pull_request_template.md` のテンプレートに従う
