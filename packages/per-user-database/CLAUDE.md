# packages/per-user-database

ユーザーごとに独立したTursoデータベースを管理するパッケージ。

## アーキテクチャ

- **Per-User Database構成**: 各ユーザーに1つのTursoデータベースを割り当てる（ADR-005）
- **スキーマ進化**: 接続時にDrizzle ORMのマイグレーションを自動実行（Turso Multi-DB Schemasは非推奨、ADR-020）
- **DB名の生成**: `next-lift-{APP_ENV}-user-{SHA256ハッシュ16文字}` 形式。同一userIdは常に同じDB名（冪等）

## エクスポート構成

| エクスポートパス | 機能 |
| --- | --- |
| `./create-database` | Per-User DB作成（Turso API経由） + トークン発行 |
| `./client` | Drizzle ORMクライアント作成（マイグレーション自動実行あり/なし） |
| `./apply-migration` | マイグレーション適用 |
| `./database-schemas` | Drizzleテーブル定義 |
| `./testing` | モック関数・ファクトリ |
| `./migrations` | Expo/React Native用マイグレーションファイル |

## DB作成フロー

1. `createTursoPerUserDatabase(userId)` を呼び出す
2. userIdからSHA256ハッシュでDB名を生成
3. `@next-lift/turso` の `createDatabase` でTurso Platform APIにDB作成リクエスト
4. `@next-lift/turso` の `issueToken` で30日間有効なJWTトークンを発行
5. `{ name, url, authToken, expiresAt }` を返却

## クライアント接続

- `createPerUserDatabaseClient(config)`: 接続時にマイグレーション自動実行。既存ユーザーのDBにスキーマ変更を反映する唯一の手段
- `createPerUserDatabaseClientWithoutMigration(config)`: マイグレーションなし。テスト環境やセットアップ直後に使用

## 既知のリスクと制約

- **DB作成失敗**: Turso Platform APIの障害時、ユーザーのDB作成が失敗する可能性がある
- **トークン有効期限**: 30日間。期限切れ前の更新メカニズムが必要
- **DB不整合**: DB作成成功後にトークン発行が失敗すると、DBは存在するがアクセスできない状態になる（`createDatabase` の冪等性で再試行可能）
- **マイグレーション失敗**: 接続時のマイグレーションが失敗した場合、ユーザーはDBにアクセスできない
- **スケール上限**: Turso Scalerプランで最大10,000データベース

## Expo/React Native対応

- `dialect: "sqlite" + driver: "expo"` 設定により、SQLマイグレーションとReact Native用の `migrations.js` を同時生成
- TursoはSQLiteベースのため、生成されるSQLは `dialect: "turso"` と同一
- `migrations.js` は `drizzle/migrations.js` にエクスポートされ、iOSアプリから `@next-lift/per-user-database/migrations` でインポート可能

## テスト環境

- インメモリSQLite（`:memory:`）を使用
- `vi.hoisted()` でモック前にDB初期化
- `beforeEach` でテーブルドロップ + マイグレーション再実行
- `@praha/drizzle-factory` でテストデータ生成
