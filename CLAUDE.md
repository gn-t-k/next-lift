# CLAUDE.md

このファイルは、このリポジトリで作業する際にClaude Code (claude.ai/code) に対して提供するガイダンスです。

## 言語設定

- ユーザーへの応答は日本語で行う

## 関連ドキュメント

- @docs/project/overview.md : プロジェクト概要、機能、開発状況
- @docs/architecture-decision-record/overview.md : システムアーキテクチャと設計原則
- @docs/model-based-ui-design/ : UI設計仕様（ユースケース、タスク分析、コンセプト定義）

## 開発ルール

以下のルールファイルを参照:

- @.claude/rules/development-flow.md : 開発フロー（合意形成、設計プロセス）
- @.claude/rules/coding-style.md : コーディング規約
- @.claude/rules/error-handling.md : エラー修正手順
- @.claude/rules/testing.md : テスト開発ルール

## プロジェクト構造

```text
apps/
  web/   # Webアプリケーション
  ios/   # iOSアプリケーション

packages/
  env/                 # 環境変数の定義と取得
  utilities/           # 汎用ユーティリティ関数
  turso/               # Turso Platform APIとの通信
  authentication/      # 認証とPer-User DBトークン管理
  per-user-database/   # Per-User DBの作成とアクセス
  react-components/    # 共通UIコンポーネント
  tailwind-config/     # 共通スタイル定義
```

## 検証コマンド

- `pnpm type-check` : 型チェック
- `pnpm lint` : Biomeによるリント
- `pnpm test` : テスト実行
- `pnpm build` : ビルド確認

## 開発プロセス

### 設計の意思決定

- 提案する際は、必ず理由をセットで説明する
- ユーザーの質問に対して、安易に迎合しない
- 複数の選択肢がある場合は、メリット・デメリットを比較して提示する

### 実装前の確認

1. 公式ドキュメントを包括的に読む
2. 複数のアプローチを比較評価する（パフォーマンス、UX、保守性）
3. プロジェクト固有のコンポーネント/関数のAPIを確認する
4. 型定義を先に確認してから実装する

### パッケージ開発

- 最新のパッケージバージョンを必ず確認する（`npm view <package-name> version`）
- 公式ドキュメントをWebFetchで確認してから実装する
- パッケージ内で完結するテストや確認は、パッケージ内で実施してから他のパッケージやシステムと統合する
- エラーや警告は次のタスクに進む前に解消する

### ファイル操作

- **`/tmp`ディレクトリの使用は禁止**
  - 一時ファイルが必要な場合は、作業ディレクトリ内に作成する
  - 作業完了後は一時ファイルを削除する

### 問題解決アプローチ

- 新しい技術スタックを導入する際は、公式ドキュメントを先に包括的に読む
- とくに組み合わせ（例: monorepo + フレームワーク + デプロイサービス）の場合は、公式のベストプラクティスを最優先で確認
- エラーが出たら、そのサービスの基本概念（例: Vercelの「Root Directory」）から理解する

### 開発ツールの活用

- **調査・デバッグ時は、利用可能なMCPツールを最優先で使用する**
  - Sentry MCP: エラー監視、イシュー詳細確認
  - Chrome DevTools MCP: ブラウザ操作、ネットワーク/コンソールログ確認
  - Next.js Runtime MCP: Next.jsの実行時エラー、ビルド診断
- **ツールの使用判断**
  - curlやBashコマンドよりも、専用MCPツールを優先
  - ツールが使えない場合のみ、代替手段を使用
  - 指示を待たず、自発的にツールを活用する

### 技術的決定の参照

- **新しいタスクを始める前に、関連するADRを確認する**
  - `docs/architecture-decision-record/`ディレクトリを検索
  - とくに環境構築、アーキテクチャに関わる作業では必須
- **既存の決定と矛盾する提案をしない**
  - ADRで決定済みの内容を覆す提案は避ける
  - 変更が必要な場合は、新しいADRの作成を提案する
- **ADRが見つからない場合のみ、新しい提案を行う**
