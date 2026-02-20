# T-1: turso — listDatabasesモック未エクスポート

**パッケージ**: @next-lift/turso
**優先度**: 高

## 問題

`testing/index.ts`に`listDatabases`のモックが再エクスポートされていない。他パッケージから`@next-lift/turso/testing`経由で`mockListDatabasesOk`/`mockListDatabasesError`を使えない。

## 修正内容

`mockListDatabasesOk`と`mockListDatabasesError`のre-exportを追加。

## 対象ファイル

- `packages/turso/src/testing/index.ts`

## 検証方法

- `pnpm --filter @next-lift/turso type-check` が通ること
