# CLAUDE.md

## 言語設定

- ユーザーへの応答は日本語で行う

## 関連ドキュメント

- docs/project/overview.md : プロジェクト概要、開発計画
- docs/architecture-decision-record/overview.md : システムアーキテクチャと設計原則

## 開発ルール

コードレビュー・CI分析などで問題を発見した場合は `/issue` スキルでGitHub Issueとして記録する。

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

## 開発の基本方針

### 実装の進め方

作業内容が自明でない場合は `/dev-workflow` スキルを使用。
タスク分解には `/breakdown`、実装には `/tdd` など、適切なスキルを活用して進める。

### 設計の意思決定

- 複数の案を比較し、理由をセットで提案する。ユーザーの意見に安易に迎合しない
- 新しいタスクを始める前に `docs/architecture-decision-record/` を確認する
  - ADRで決定済みの内容を覆す提案は避ける
  - コードに現れない設計の意思決定は、ADRに記録することを推奨

### ディレクトリ構造

- 関連するファイルは近くに配置する（コロケーション）
- ファイルの種類ではなく、機能単位でディレクトリを構成する

### ライブラリの利用

- 公式ドキュメントを読んでから実装する（トレーニングデータに頼らない）
- 最新バージョンを確認する（`npm view <package-name> version`）

### ツールの活用

- 利用可能なツール（MCPサーバー、スキル）を自発的に活用する
- 指示を待たず、調査・デバッグに適したツールを選んで使う
