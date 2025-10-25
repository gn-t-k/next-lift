# @next-lift/auth-database

Next Liftの認証用データベースパッケージ。Better AuthとDrizzle ORMを使用して、Authentication Databaseの管理を行います。

## 概要

このパッケージは、以下を提供します：

### `auth`

Better Authインスタンス。認証エンドポイントの作成やユーザー管理に使用します。

```typescript
import { auth } from "@next-lift/auth-database";
```

環境変数の設定に応じて、リモートデータベース（本番環境）またはローカルファイル（開発環境）に接続します。

### `createDatabase`

データベースクライアントを作成する関数。以下の3種類の接続タイプに対応しています：

```typescript
import { createDatabase } from "@next-lift/auth-database";

// リモート接続（Turso）
const remoteDb = createDatabase({
  type: "remote",
  url: "libsql://...",
  authToken: "...",
});

// ローカルファイル
const fileDb = createDatabase({ type: "file" });

// インメモリ（テスト用途など）
const memoryDb = createDatabase({ type: "memory" });
```

主にテスト環境で使用することを想定しています。詳細は [TESTING.md](./TESTING.md) を参照してください。

## データベース構成

### 接続先の自動判定

環境変数の有無で接続先を自動判定します：

- **リモート接続**: `TURSO_AUTH_DATABASE_URL` と `TURSO_AUTH_DATABASE_AUTH_TOKEN` が設定されている場合
- **ローカルファイル**: 環境変数が未設定の場合（`file:development-auth.db`）

### スキーマ

Better Authが必要とする以下のテーブルを管理します：

- `user`: ユーザー情報
- `session`: セッション情報
- `account`: OAuth/SSO接続情報
- `verification`: 検証情報

## スクリプト

### `pnpm lint`

Biomeによるlintチェックを実行します。

```bash
pnpm lint
```

### `pnpm type-check`

TypeScriptの型チェックを実行します。

```bash
pnpm type-check
```

### `pnpm migration:apply`

データベースマイグレーションを実行します。環境変数の設定によって、リモートまたはローカルのデータベースに適用されます。

```bash
# ローカル環境（環境変数未設定の場合）
pnpm migration:apply

# 本番環境（環境変数設定済みの場合）
pnpm migration:apply
```

### `pnpm db:studio`

Drizzle Studioを起動してデータベースの内容をGUIで確認できます。

```bash
pnpm db:studio
```

### `pnpm generate:schema`

Better Auth CLIを使用してスキーマファイルを再生成します。Better Authのバージョンアップ時やプラグイン追加時に実行します。

```bash
pnpm generate:schema
```

## ディレクトリ構成

```plaintext
packages/auth-database/
├── src/
│   ├── auth.ts               # Better Auth 設定
│   ├── client.ts             # データベースクライアント
│   ├── index.ts              # エクスポート
│   └── generated/            # 自動生成ファイル
│       └── schema.ts         # Drizzle スキーマ（Better Auth CLI で生成）
├── drizzle/                  # マイグレーションファイル（Drizzle Kit で生成）
├── drizzle.config.ts         # Drizzle Kit 設定
├── tsconfig.json
├── package.json
└── README.md
```

## 開発ワークフロー

### スキーマの更新

1. Better Authの設定を変更（プラグイン追加など）
2. スキーマを再生成: `pnpm generate:schema`
3. マイグレーションファイルを生成: `pnpm migration:generate`（通常は不要）
4. マイグレーションを適用: `pnpm migration:apply`

### ローカル開発

環境変数を設定せずに開発すると、ローカルファイル（`development-auth.db`）が使用されます。

### 本番環境へのマイグレーション

1. `.env` で環境変数を設定
2. `pnpm migration:apply` を実行

## 注意事項

- `src/generated/` と `drizzle/` は自動生成ファイルのため、手動で編集しないでください
- マイグレーションは慎重に実行してください（とくに本番環境）
