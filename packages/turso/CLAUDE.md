# packages/turso

Turso Platform APIとの通信を担うパッケージ。データベースのCRUDとトークン発行を提供する。

## 機能

| 提供機能 | 説明 |
| --- | --- |
| DB作成 | `./create-database` からimport。冪等: 409 Conflictは既存DB情報を返却 |
| JWTトークン発行 | `./issue-token` からimport。永続/期限付き |
| DB削除 | `./delete-database` からimport |
| DB一覧取得 | `./list-databases` からimport |
| テスト用モック関数 | `./testing` からimport |
| DB作成CLI | `pnpm db:create` で実行 |
| DB削除CLI | `pnpm db:delete` で実行。プレビュー環境以外は`--force`が必要 |
| トークン発行CLI | `pnpm db:issue-token` で実行 |
| DB一覧表示CLI | `pnpm db:list` で実行 |

## 使い方

### データベースの作成

```typescript
import { createDatabase } from "@next-lift/turso/create-database";

const result = await createDatabase({
  name: "my-database",
  platformApiToken: process.env.TURSO_PLATFORM_API_TOKEN,
  organization: process.env.TURSO_ORGANIZATION,
});
// 同名DBが既に存在する場合（409）、エラーではなく既存DBの情報を返す
```

### JWTトークンの発行

```typescript
import { issueToken } from "@next-lift/turso/issue-token";

// 期限付きトークン（30日間）
const result = await issueToken({
  databaseName: "my-database",
  expiresInDays: 30,
  platformApiToken: process.env.TURSO_PLATFORM_API_TOKEN,
  organization: process.env.TURSO_ORGANIZATION,
});

// 永続トークン
const permanent = await issueToken({
  databaseName: "my-database",
  expiresInDays: null,
  platformApiToken: process.env.TURSO_PLATFORM_API_TOKEN,
  organization: process.env.TURSO_ORGANIZATION,
});
```

### テストでのモック利用

```typescript
import { mockCreateDatabaseOk, mockCreateDatabaseError } from "@next-lift/turso/testing";

beforeEach(() => {
  mockCreateDatabaseOk(); // デフォルト値で成功をモック
  // または
  mockCreateDatabaseError(new CreateDatabaseError());
});
```

## 開発ガイド

### アーキテクチャ

- **Turso Platform API**: `https://api.turso.tech/v1/organizations/{org}/databases` をベースにHTTP通信
- **認証**: Bearer Token（`TURSO_PLATFORM_API_TOKEN`）
- **エラーハンドリング**: `@praha/byethrow` のResult型で成功/失敗を型安全に表現
- **レスポンス検証**: ZodスキーマでAPIレスポンスをバリデーション

### テスト環境

- `globalThis.fetch` をモックしてAPIリクエストをテスト
- 各テスト前に `fetch` モックをリセット

## 制約と注意事項

- **createDatabaseの冪等性**: 同名DBが存在する場合（409）、エラーではなく既存DBの情報を返す。呼び出し側はDB存在チェック不要
- **issueTokenのオーバーロード**: 永続トークン（`expiresInDays: null`）と期限付きトークン（`expiresInDays: number`）で戻り値の型が変わる
- **削除の安全策**: CLIの `db:delete` はプレビュー環境のDBパターン（`next-lift-preview-pr\d+-`）以外の削除に `--force` を要求
- **同時書き込み制限**: SQLite（Turso）は単一ライターモデル。同時書き込みでロック競合の可能性あり
- **Embedded Replicas**: iOS AppではローカルSQLiteにレプリケーション。読み取りはローカル、書き込みはリモート
