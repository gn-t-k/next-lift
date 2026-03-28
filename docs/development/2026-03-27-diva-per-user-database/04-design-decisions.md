# 設計判断: per-user-database への diva curried provider 導入

## 公開 API の設計

### `./client` export を削除し、`./context` に統合

- `createPerUserDatabaseClient` はパッケージ内部に隠蔽
- `./context` から `getPerUserDatabase`（resolver）と `runInPerUserDatabaseScope`（scope 関数）のみ公開
- `withPerUserDatabase`（provider）は内部専用
- 理由: クライアント作成・マイグレーション実行は利用側が知る必要のない実装詳細。API 表面積を最小化し、「マイグレーション実行忘れ」を構造的に防ぐ

### `runInPerUserDatabaseScope` でクライアントを1つだけ作成

- マイグレーションとスコープで同一クライアントを共有
- `migrateDatabase` ヘルパーを `apply-migration/` に配置し、`applyMigration`（公開 API）と `runInPerUserDatabaseScope` の両方から使用
- 理由: 2つのクライアント作成 + close なしの接続リークを回避

### async fn 対応

- `fn: () => T | Promise<T>` を受け付け、`R.ResultAsync<Awaited<T>, ApplyMigrationError>` を返す
- `R.try` + `async` パターンで内部的に `await` し、Promise を flatten
- 理由: drizzle のクエリが async のため、利用側で自然に `async () => { ... }` を渡せる必要がある

## authentication パッケージとの設計差異

- authentication: `withAuthenticationDatabase = withDatabase(createDatabaseClient)` — 起動時に決定する DB を curried provider で注入
- per-user-database: `runInPerUserDatabaseScope(credentials, fn)` — 動的な credentials + アクセス時マイグレーションが必要なため、curried provider ではなく Result 型を返す scope 関数
- 差異の理由: per-user DB は接続先がリクエストごとに異なり、かつスキーマ進化への対応としてアクセス時マイグレーションが必要（ADR-020）
