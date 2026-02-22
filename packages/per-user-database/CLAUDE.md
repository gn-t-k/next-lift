# packages/per-user-database

ユーザーごとに独立したTursoデータベースを管理するパッケージ。

## 機能

| 提供機能 | 説明 |
| --- | --- |
| Per-User DB作成 | `./create-database` からimport。Turso API経由でDB作成 + トークン発行 |
| Drizzle ORMクライアント | `./client` からimport。マイグレーション自動実行あり/なし |
| マイグレーション適用 | `./apply-migration` からimport |
| テーブル定義 | `./database-schemas` からimport |
| テスト用モック・ファクトリ | `./testing` からimport |
| マイグレーションファイル | `./migrations` からimport。Expo/React Native用 |

## 使い方

### Per-User DBの作成

```typescript
import { createTursoPerUserDatabase } from "@next-lift/per-user-database/create-database";

// userIdからSHA256ハッシュでDB名を生成し、Turso Platform APIでDB作成 + トークン発行
const result = await createTursoPerUserDatabase(userId);
// result: { name, url, authToken, expiresAt }
```

### DBクライアントの接続

```typescript
import {
  createPerUserDatabaseClient,
  createPerUserDatabaseClientWithoutMigration,
} from "@next-lift/per-user-database/client";

// マイグレーション自動実行あり（既存ユーザーのスキーマ変更に対応）
const client = await createPerUserDatabaseClient({ url, authToken });

// マイグレーションなし（テスト環境やセットアップ直後に使用）
const clientWithoutMigration = createPerUserDatabaseClientWithoutMigration({ url, authToken });
```

### iOS（React Native）でのマイグレーション利用

```typescript
import migrations from "@next-lift/per-user-database/migrations";

// op-sqliteとDrizzle ORMでiOSのローカルDBにマイグレーション適用
```

### テストでのモック・ファクトリ利用

```typescript
import {
  mockCreateTursoPerUserDatabaseOk,
  mockCreateTursoPerUserDatabaseError,
} from "@next-lift/per-user-database/testing";

beforeEach(() => {
  mockCreateTursoPerUserDatabaseOk(); // デフォルト値で成功をモック
});
```

## 開発ガイド

### アーキテクチャ

- **Per-User Database構成**: 各ユーザーに1つのTursoデータベースを割り当てる（ADR-005）
- **スキーマ進化**: 接続時にDrizzle ORMのマイグレーションを自動実行（Turso Multi-DB Schemasは非推奨、ADR-020）
- **DB名の生成**: `next-lift-{APP_ENV}-user-{SHA256ハッシュ16文字}` 形式。同一userIdは常に同じDB名（冪等）

### Expo/React Native対応

- `dialect: "sqlite" + driver: "expo"` 設定により、SQLマイグレーションとReact Native用の `migrations.js` を同時生成
- TursoはSQLiteベースのため、生成されるSQLは `dialect: "turso"` と同一
- `migrations.js` は `drizzle/migrations.js` にエクスポートされ、iOSアプリから `@next-lift/per-user-database/migrations` でインポート可能

### テスト環境

- インメモリSQLite（`:memory:`）を使用
- `vi.hoisted()` でモック前にDB初期化
- `beforeEach` でテーブルドロップ + マイグレーション再実行
- `@praha/drizzle-factory` でテストデータ生成

## 制約と注意事項

- **DB作成失敗**: Turso Platform APIの障害時、ユーザーのDB作成が失敗する可能性がある
- **トークン有効期限**: 30日間。期限切れ前の更新メカニズムが必要
- **DB不整合**: DB作成成功後にトークン発行が失敗すると、DBは存在するがアクセスできない状態になる（`createDatabase` の冪等性で再試行可能）
- **マイグレーション失敗**: 接続時のマイグレーションが失敗した場合、ユーザーはDBにアクセスできない
- **スケール上限**: Turso Scalerプランで最大10,000データベース
- 関連ADR: [ADR-005](../../docs/architecture-decision-record/005-per-user-database-architecture.md), [ADR-020](../../docs/architecture-decision-record/020-drizzle-migration-strategy.md)
