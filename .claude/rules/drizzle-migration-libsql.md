---
paths:
  - "packages/per-user-database/drizzle/*.sql"
  - "packages/per-user-database/src/database-schemas/**/*.ts"
---

# drizzle-kit の table-recreation マイグレーションは libsql/turso で失敗する

`packages/per-user-database/` でスキーマを変更したとき、drizzle-kit が `__new_<table>` 経由のテーブル再作成 SQL を生成することがある。これは libsql/turso 環境で **autoindex 名の衝突** により失敗する。

## 問題

drizzle-kit は SQLite で以下のスキーマ変更があると table-recreation を生成する:

- CHECK 制約の追加
- カラム制約（NOT NULL など）の変更
- 主キー変更

生成される SQL の典型:

```sql
PRAGMA foreign_keys=OFF;
CREATE TABLE `__new_exercises` (...);
INSERT INTO `__new_exercises`(...) SELECT ... FROM `exercises`;
DROP TABLE `exercises`;
ALTER TABLE `__new_exercises` RENAME TO `exercises`;
PRAGMA foreign_keys=ON;
```

過去に同テーブルが table-recreation を経ていると、新規 `__new_<table>` の autoindex 名 `sqlite_autoindex___new_<table>_1` が **既に存在する** として `CREATE TABLE` が失敗する。`sqlite_master` 上には現れないが libsql 内部メタデータに残留しているとみられる。

エラーメッセージ例:

```
Parse error: index "sqlite_autoindex___new_exercises_1" already exists
```

## 回避策

`ALTER TABLE ADD COLUMN` にインライン CHECK で書き直して table-recreation を回避する。

```sql
ALTER TABLE `exercises` ADD COLUMN `weight_step` real NOT NULL DEFAULT 2.5
  CONSTRAINT `exercises_weight_step_check` CHECK (`weight_step` > 0);
```

drizzle-kit の自動生成を採用すると必ず引っかかるため、生成された `0xxx_*.sql` を手動で書き換える運用とする。`meta/0xxx_snapshot.json` と `_journal.json` は drizzle-kit が生成したまま残してよい（マイグレーション本体だけ書き換える）。

## 適用範囲

`ALTER TABLE ADD COLUMN` 1文で表現できるケースに限る:

- カラム追加（NOT NULL DEFAULT + CHECK 含む）

主キー変更や既存カラムの制約変更は別途検討が必要。

## 検証

- 検証日: 2026-05-02
- 検証環境: `@tursodatabase/database` の `:memory:`
- 関連: gn-t-k/next-lift#712
