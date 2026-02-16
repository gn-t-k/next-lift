# packages/turso

Turso Platform APIとの通信を担うパッケージ。データベースのCRUDとトークン発行を提供する。

## アーキテクチャ

- **Turso Platform API**: `https://api.turso.tech/v1/organizations/{org}/databases` をベースにHTTP通信
- **認証**: Bearer Token（`TURSO_PLATFORM_API_TOKEN`）
- **エラーハンドリング**: `@praha/byethrow` のResult型で成功/失敗を型安全に表現
- **レスポンス検証**: ZodスキーマでAPIレスポンスをバリデーション

## エクスポート構成

| エクスポートパス | 機能 |
| --- | --- |
| `./create-database` | DB作成（冪等: 409 Conflictは既存DB情報を返却） |
| `./issue-token` | JWTトークン発行（永続/期限付き） |
| `./delete-database` | DB削除 |
| `./list-databases` | DB一覧取得 |
| `./testing` | モック関数 |

## 主要な設計判断

- **createDatabaseの冪等性**: 同名DBが存在する場合（409）、エラーではなく既存DBの情報を返す。呼び出し側はDB存在チェック不要
- **issueTokenのオーバーロード**: 永続トークン（`expiresInDays: null`）と期限付きトークン（`expiresInDays: number`）で戻り値の型が変わる
- **CLIツール**: 開発・運用向けにCLIコマンドを提供（`pnpm db:create`, `db:delete`, `db:issue-token`, `db:list`）
- **削除の安全策**: CLIの `db:delete` はプレビュー環境のDBパターン（`next-lift-preview-pr\d+-`）以外の削除に `--force` を要求

## SQLite固有の制約

- **型の柔軟性**: SQLiteは型アフィニティが緩い。Drizzle ORMのスキーマ定義で型安全性を担保
- **同時書き込み制限**: SQLite（Turso）は単一ライターモデル。同時書き込みでロック競合の可能性あり
- **Embedded Replicas**: iOS AppではローカルSQLiteにレプリケーション。読み取りはローカル、書き込みはリモート

## テスト環境

- `globalThis.fetch` をモックしてAPIリクエストをテスト
- 各テスト前に `fetch` モックをリセット
- モックパターン: `mockCreateDatabaseOk()` / `mockCreateDatabaseError()`
