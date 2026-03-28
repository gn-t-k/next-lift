# TDD実装: per-user-database への diva curried provider 導入

## ステータス

- 状態: 完了
- 最終更新: 2026-03-28

## ToDoリスト

### 1. `@praha/diva` の依存追加と context 定義

- ステータス: `done`
- 説明: `packages/per-user-database` に `@praha/diva` を追加し、`src/helpers/database-context.ts` に `getPerUserDatabase` / `withPerUserDatabase` を定義する。`package.json` の exports に `"./context"` エントリを追加する
- 完了条件:
  - 型: `getPerUserDatabase` が `LibSQLDatabase<typeof schema>` を返す型であること
  - 型: `withPerUserDatabase` が `ProviderFn` 型に準拠すること
  - 型: `pnpm type-check` がパスすること
- メモ:

### 2. スキーマ型付きインメモリ DB の作成

- ステータス: `done`
- 説明: `src/testing/mocked-per-user-database.ts` を作成する。`packages/authentication` の `mocked-authentication-database.ts` と同様に、`drizzle(client, { schema })` でスキーマ型付きのインメモリ DB を提供する
- 完了条件:
  - 型: `mockedPerUserDatabase` が `LibSQLDatabase<typeof schema>` 型であること
  - テスト: `beforeEach` でマイグレーションが実行され、テーブルが利用可能であること
- メモ:

### 3. mockContext ヘルパーの作成と re-export

- ステータス: `done`
- 説明: `src/helpers/database-context.mock.ts` を作成し、`mockContext(withPerUserDatabase, () => mockedPerUserDatabase)` パターンを提供する。`src/testing/index.ts` から re-export する
- 完了条件:
  - 型: mock ヘルパーが `withPerUserDatabase` の型と整合すること
  - 確認: `@next-lift/per-user-database/testing` からインポート可能であること
- メモ:

### 4. 合成ヘルパーの実装とテスト

- ステータス: `done`
- 説明: `apps/web/src/libs/per-user-database/per-user-database-context.ts` に、userId を渡すだけで per-user DB スコープに入れる合成ヘルパーを作成する。`getValidCredentials` でクレデンシャルを取得し、`createPerUserDatabaseClientWithoutMigration` でクライアントを作成し、`withPerUserDatabase` スコープ内でコールバックを実行する。エラーハンドリングは Result 型で行う
- 完了条件:
  - テスト: クレデンシャル取得成功時、コールバックが per-user DB スコープ内で実行されること
  - テスト: クレデンシャル取得失敗時、エラーが Result 型で返されること
  - 型: `pnpm type-check` がパスすること
- メモ: リファクタリングで大幅に設計変更。マイグレーション追加、client/apply-migration の重複解消、`./client` export 削除、`runInPerUserDatabaseScope` をパッケージ内に移動し実装詳細を隠蔽。`./context` は resolver (`getPerUserDatabase`) + scope 関数 (`runInPerUserDatabaseScope`) のみ公開。

### 5. 全検証コマンドの実行

- ステータス: `done`
- 説明: `pnpm type-check && pnpm lint && pnpm test` を実行し、既存テストを含めすべてパスすることを確認する
- 完了条件:
  - 確認: `pnpm type-check && pnpm lint && pnpm test` が成功すること
- メモ:

### 6. 合成ヘルパーを使った動作確認

- ステータス: `done`
- 説明: apps/web で合成ヘルパーを実際に使う簡易的なコード（server action 等）を書き、ブラウザから実行して per-user DB へのアクセスが正常に動作することを確認する。動作確認後、確認用コードは削除する
- 完了条件:
  - 確認: ブラウザから合成ヘルパー経由で per-user DB にアクセスし、データの読み書きができること
  - 確認: エラーケース（存在しないユーザー等）で Result 型のエラーが返ること
- メモ:

## 全体メモ

