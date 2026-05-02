# packages/turso-drizzle-adapter

`@tursodatabase/*` 系ドライバーと Drizzle ORM を `drizzle-orm/sqlite-proxy` 経由で橋渡しするための暫定アダプタパッケージ。Drizzle 公式が `@tursodatabase/*` 用ドライバーを提供したら剥がす想定。

`drizzle-orm/sqlite-proxy` は `(sql, params, method) => Promise<{rows: ...}>` を実装すれば任意のドライバを drizzle に繋げられる仕組み。本パッケージは各ドライバの実行 API を共通の `SqliteExecutor` 抽象に揃え、それを使って drizzle インスタンス生成 / マイグレーション適用の API を露出する。

## 機能

公開エントリは **ドライバ軸** で 2 つのサブパスに分離している（root は共通型のみ）。Web bundle に混入させたくないネイティブバインディング（`@tursodatabase/database`）と、HTTP プロトコルで動く serverless 系を確実に切り分けるため。

### `@next-lift/turso-drizzle-adapter/serverless`（Web / Vercel Serverless 用）

`@tursodatabase/serverless/compat`（HTTP プロトコル）に依存するエントリ。Vercel Serverless / Edge / iOS など、ネイティブバインディングを持ち込めない環境向け。

| 提供API | 説明 |
| --- | --- |
| `createTursoServerlessClient` | `@tursodatabase/serverless/compat` の `createClient({ url, authToken })` を呼ぶ薄いラッパー |
| `createDrizzleFromTursoServerless` | `Client` とスキーマから `drizzle-orm/sqlite-proxy` 経由の drizzle インスタンスを生成 |
| `applyMigrationsToTursoServerless` | `drizzle/<n>_*.sql` 形式のマイグレーションを `Client` 経由で適用（FK 有効化 + トランザクション内で順次 exec） |

### `@next-lift/turso-drizzle-adapter/database`（Node ローカル / テスト用）

`@tursodatabase/database`（ネイティブ `.node` バインディング）に依存するエントリ。テストの `:memory:` 接続や CLI でのローカル DB 操作向け。**Web bundle に混入させないため `./serverless` とは別パスで分離している**（混入すると Turbopack の `non-ecmascript placeable asset` エラーで落ちる）。

| 提供API | 説明 |
| --- | --- |
| `createTursoDatabaseHandle` | `@tursodatabase/database` の `connect()` を呼ぶ薄いラッパー |
| `createDrizzleFromTursoDatabase` | `Database` ハンドルとスキーマから drizzle インスタンスを生成 |
| `applyMigrations` | マイグレーションを `Database` ハンドルに適用 |

### `@next-lift/turso-drizzle-adapter`（root: 共通型のみ）

| 提供型 | 説明 |
| --- | --- |
| `SqliteRunResult` | drizzle のドライバ間で共通に扱える run 結果の最小契約。`BaseSQLiteDatabase<'async', SqliteRunResult, schema>` の形で driver 非依存の context 型を書くために利用する |

## 使い方

### Web から接続（serverless/compat）

```typescript
import {
  applyMigrationsToTursoServerless,
  createDrizzleFromTursoServerless,
  createTursoServerlessClient,
} from "@next-lift/turso-drizzle-adapter/serverless";
import * as schema from "./database-schemas";

const client = createTursoServerlessClient({ url, authToken });
await client.execute("PRAGMA foreign_keys = ON");
await applyMigrationsToTursoServerless(client, "./drizzle");
const db = createDrizzleFromTursoServerless(client, schema);

const rows = await db.select().from(schema.programs);
```

### Node ローカル / テストから接続（database, :memory:）

```typescript
import {
  applyMigrations,
  createDrizzleFromTursoDatabase,
  createTursoDatabaseHandle,
} from "@next-lift/turso-drizzle-adapter/database";
import * as schema from "./database-schemas";

const handle = await createTursoDatabaseHandle(":memory:");
await applyMigrations(handle, "./drizzle");
const db = createDrizzleFromTursoDatabase(handle, schema);
```

### context 型での共通契約

```typescript
import type { SqliteRunResult } from "@next-lift/turso-drizzle-adapter";
import type { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";

// database / serverless どちらの drizzle インスタンスにも assignable な context 型
type DatabaseContext = BaseSQLiteDatabase<"async", SqliteRunResult, typeof schema>;
```

## 開発ガイド

### ディレクトリ構造

```text
src/
  sqlite-run-result.ts          # 公開: root エントリ（SqliteRunResult の定義）
  drivers/                      # 公開: ドライバ別ファサード
    serverless/
      index.ts                  # ./serverless エントリ
      create-client.ts          # compat Client 生成
      create-drizzle.ts         # serverless 用 drizzle 生成
      apply-migrations.ts       # serverless 用マイグレーション適用
    database/
      index.ts                  # ./database エントリ
      create-handle.ts          # Database ハンドル生成
      create-handle.test.ts
      create-drizzle.ts         # database 用 drizzle 生成
      apply-migrations.ts       # database 用マイグレーション適用
  sqlite-proxy/                 # 内部: drizzle-orm/sqlite-proxy への翻訳層
    executor.ts                 # 共通 SqliteExecutor 契約
    create-database-executor.ts # database → executor wrapper
    create-serverless-executor.ts # serverless/compat → executor wrapper
    proxy-execute.ts            # SQL 実行 → sqlite-proxy 形式の結果へ変換
    proxy-transaction.ts        # トランザクション境界 → BEGIN/COMMIT/ROLLBACK + SAVEPOINT へ変換
```

`drivers/` がドライバ別の公開ファサード、`sqlite-proxy/` は本パッケージ内部からのみ呼ばれる翻訳層。

## 制約と注意事項

- **暫定アダプタ**: Drizzle 公式が `@tursodatabase/*` 用ドライバーを提供したらパッケージごと削除する想定。`createDrizzleFromTursoDatabase` / `createDrizzleFromTursoServerless` の先頭コメント参照
- **エントリ分離の理由**: `@tursodatabase/database` は `.node` ネイティブバインディングを含むため、Web bundle に混入すると Turbopack の `non-ecmascript placeable asset` エラーで落ちる。`./serverless` と `./database` をドライバ軸で別パスに分離し、root には依存を持たない共通型のみ置くことで、利用側が誤って混在させても bundler が片側だけを解析する構造にしている
- **対応ドライバー**: `@tursodatabase/database`（in-memory + ローカルファイル）/ `@tursodatabase/serverless/compat`（HTTP）。Phase 4 で `@tursodatabase/sync-react-native` を `./sync-react-native` サブパスとして追加予定
- **`PRAGMA foreign_keys`**: `applyMigrations` / `applyMigrationsToTursoServerless` の中で明示的に `ON` にしている（接続時のデフォルトは将来変わるリスクがあるため、ADR-026）
- **トランザクション境界**: `proxy-transaction.ts` がネスト時の SAVEPOINT も含めて翻訳。drizzle 経由のトランザクションは drizzle 自身が SQL を発行するため `proxyExecute` を通る。`proxyTransaction` は drizzle 非経由でトランザクションを扱う場面用（`applyMigrations` 等）
- 関連ADR: [ADR-029](../../docs/architecture-decision-record/029-tursodatabase-suite-migration.md)
