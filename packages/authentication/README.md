# @next-lift/authentication

Next Liftの認証パッケージ。Better AuthとDrizzle ORMを使用して、Authentication Databaseの管理を行います。

## Exports

このパッケージは3つのモジュールを提供します：

### `@next-lift/authentication/instance`

本番用Better Authインスタンス:

```typescript
import { auth } from "@next-lift/authentication/instance";

// 認証エンドポイントの作成（Next.js Route Handlers）
export const { GET, POST } = auth.handler;

// サーバー側でのユーザー情報取得
const user = await auth.api.getUser({ userId: "..." });
```

環境変数の設定に応じて、リモートデータベース（本番環境）またはローカルファイル（開発環境）に接続します。

### `@next-lift/authentication/better-auth`

Better Authのすべての機能をre-export:

```typescript
// クライアント作成
import { createAuthClient } from "@next-lift/authentication/better-auth";

const authClient = createAuthClient();

// Google認証
await authClient.signIn.social({ provider: "google" });

// 型定義
import type { User, Session } from "@next-lift/authentication/better-auth";
```

### `@next-lift/authentication/test-helpers`

テスト用ヘルパー:

```typescript
import { createTestAuth } from "@next-lift/authentication/test-helpers";

describe("認証テスト", () => {
  let testAuth;

  beforeEach(async () => {
    testAuth = await createTestAuth();
  });

  it("ユーザー登録できる", async () => {
    const result = await testAuth.api.signUp.email({
      email: "test@example.com",
      password: "password",
      name: "Test User",
    });
    expect(result?.user).toBeDefined();
  });
});
```

## テスト戦略

認証モジュールのテスト戦略については、[ADR-013: 認証モジュールのテスト戦略](../../docs/architecture-decision-record/013-authentication-testing-strategy.md)を参照してください。

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
packages/authentication/
├── src/
│   ├── instance.ts           # Better Authインスタンス
│   ├── better-auth.ts        # Better Authの再export
│   ├── test-helpers.ts       # テストヘルパー
│   ├── get-database.ts       # データベースクライアント（内部用）
│   └── generated/            # 自動生成ファイル
│       └── schema.ts         # Drizzleスキーマ（Better Auth CLIで生成）
├── drizzle/                  # マイグレーションファイル（Drizzle Kitで生成）
├── drizzle.config.ts         # Drizzle Kit設定
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
