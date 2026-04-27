---
paths:
  - "apps/ios/**/*.ts"
  - "apps/ios/**/*.tsx"
---

# op-sqlite で drizzle 経由の raw SQL は使わない

iOS の op-sqlite + drizzle-orm 環境で raw SQL を書くときに適用するルール。

## 問題

`drizzle-orm/op-sqlite` の `db.all(sql`...`)` / `db.get(sql`...`)` は **raw SQL の結果取得が空になる**。

- 確認バージョン: `drizzle-orm@0.45.2` / `@op-engineering/op-sqlite@15.2.11`
- 検証日: 2026-04-27
- 検証コミット: `feature/per-user-database-foreign-keys-pragma` ブランチでの実機検証

## 動くもの・動かないもの

| 経路 | 動作 |
| --- | --- |
| `db.select().from(table)` などスキーマ経由クエリ | ✅ 動作 |
| `db.insert(table).values(...)` などスキーマ経由ミューテーション | ✅ 動作 |
| `db.run(sql`PRAGMA foreign_keys = ON`)` など raw SQL の **実行のみ** | ✅ 動作 |
| `db.all(sql`SELECT 1`)` / `db.get(sql`...`)` で raw SQL の **結果取得** | ❌ 空返却 |

## 回避策

raw SQL の結果が必要な場合は、drizzle ではなく op-sqlite の生 API を使う。

```typescript
import { openSync } from "@op-engineering/op-sqlite";

const sqlite = openSync({ ... });
const result = await sqlite.execute("PRAGMA foreign_keys");
// result.rows: [{ foreign_keys: 1 }]
```

スキーマ経由で済む処理は drizzle のクエリビルダーをそのまま使えばよい。
