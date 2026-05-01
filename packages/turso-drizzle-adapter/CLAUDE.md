# packages/turso-drizzle-adapter

`@tursodatabase/*` 系ドライバーと Drizzle ORM を `drizzle-orm/sqlite-proxy` 経由で橋渡しするための暫定アダプタパッケージ。Drizzle 公式が `@tursodatabase/*` 用ドライバーを提供したら剥がす想定。

## 機能

| 提供API | 説明 |
| --- | --- |
| `createTursoDatabaseHandle` | `@tursodatabase/database` の `connect()` を呼ぶ薄いラッパー。`Database` ハンドルを返す |
| `createDrizzleFromTursoDatabase` | `Database` ハンドルとスキーマから `drizzle-orm/sqlite-proxy` 経由の drizzle インスタンスを生成 |
| `applyMigrations` | `drizzle/<n>_*.sql` 形式のマイグレーションを `Database` ハンドルに適用（FK 有効化 + トランザクション内で順次 exec） |
| `SqliteRunResult` | drizzle のドライバ間で共通に扱える run 結果の最小契約型（`rowsAffected` を含む） |

すべて root `.` から `import { ... } from "@next-lift/turso-drizzle-adapter"` で取得する。

## 使い方

### drizzle インスタンス生成 + マイグレーション適用

```typescript
import {
  applyMigrations,
  createDrizzleFromTursoDatabase,
  createTursoDatabaseHandle,
} from "@next-lift/turso-drizzle-adapter";
import * as schema from "./database-schemas";

const handle = await createTursoDatabaseHandle(":memory:");
await applyMigrations(handle, "./drizzle");
const db = createDrizzleFromTursoDatabase(handle, schema);

const rows = await db.select().from(schema.programs);
```

### context 型での共通契約

```typescript
import type { SqliteRunResult } from "@next-lift/turso-drizzle-adapter";
import type { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";

// libsql / sqlite-proxy のどちらの戻り値型にも assignable な context 型
type DatabaseContext = BaseSQLiteDatabase<"async", SqliteRunResult, typeof schema>;
```

## 開発ガイド

### ディレクトリ構造

```text
src/
  index.ts                              # 公開エントリ（re-export のみ）
  apply-migrations.ts                   # 公開: マイグレーション適用
  create-drizzle-from-turso-database.ts # 公開: drizzle インスタンス生成
  create-turso-database-handle.ts       # 公開: Database ハンドル生成
  sqlite-run-result.ts                  # 公開: 共通契約型
  sqlite-proxy/                         # 内部: drizzle-orm/sqlite-proxy への翻訳層
    proxy-execute.ts                    # SQL 実行 → sqlite-proxy 形式の結果へ変換
    proxy-transaction.ts                # トランザクション境界 → BEGIN/COMMIT/ROLLBACK + SAVEPOINT へ変換
```

`src/` 直下が公開 API、`sqlite-proxy/` は本パッケージ内部からのみ呼ばれる翻訳層。

### 本パッケージが解決している問題

`drizzle-orm/sqlite-proxy` は `(sql, params, method) => Promise<{rows: ...}>` を実装すれば任意のドライバを drizzle に繋げられる仕組み。`@tursodatabase/database` の `prepare/run/get/all` をこの形式に翻訳する処理（`sqlite-proxy/`）と、それを使った drizzle インスタンス生成 / マイグレーション適用の公開 API を本パッケージに集約している。

依存関係:

```text
authentication ──┐
                 ├──> @next-lift/turso-drizzle-adapter ──> @tursodatabase/database
per-user-database ─┘                                  └──> drizzle-orm/sqlite-proxy
```

### Phase 4 での拡張余地

ADR-029 Phase 4 で `@tursodatabase/sync-react-native` ドライバを追加する際は、`createTursoDatabaseHandle` 相当のドライバ別ハンドルヘルパーを増やしつつ `sqlite-proxy/` の翻訳層は流用できる構造。

## 制約と注意事項

- **暫定アダプタ**: Drizzle 公式が `@tursodatabase/*` 用ドライバーを提供したらパッケージごと削除する想定。`createDrizzleFromTursoDatabase` の先頭コメント参照
- **対応ドライバー**: 現状は `@tursodatabase/database`（in-memory + ローカルファイル）のみ。Phase 3 で `@tursodatabase/serverless`、Phase 4 で `@tursodatabase/sync-react-native` を追加予定
- **`PRAGMA foreign_keys`**: `applyMigrations` の中で明示的に `ON` にしている（接続時のデフォルトは将来変わるリスクがあるため、ADR-026）
- **トランザクション境界**: `proxy-transaction.ts` がネスト時の SAVEPOINT も含めて翻訳。drizzle 経由のトランザクションは drizzle 自身が SQL を発行するため `proxyExecute` を通る。`proxyTransaction` は drizzle 非経由でトランザクションを扱う場面用（`applyMigrations` 等）
- 関連ADR: [ADR-029](../../docs/architecture-decision-record/029-tursodatabase-suite-migration.md)
