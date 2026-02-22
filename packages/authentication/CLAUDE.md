# packages/authentication

Better Authを使った認証とPer-User DBクレデンシャル管理を担うパッケージ。

## 機能

| 提供機能 | 説明 |
| --- | --- |
| Better Authインスタンス生成 | `./create-auth` からimport。OAuthプロバイダー、フック設定 |
| Per-User DBクレデンシャル管理 | `./user-database-credentials` からimport。CRUD、有効なクレデンシャル取得（期限切れ時自動更新） |
| Next.js向けBetter Auth統合 | `./integrations/better-auth-nextjs` からimport |
| React/Expo向けBetter Auth統合 | `./integrations/better-auth-react` からimport |
| テスト用モック関数 | `./testing` からimport。`saveUserDatabaseCredentials`, `getValidCredentials` |

## 使い方

### Better Authインスタンスの生成

```typescript
import { createAuth } from "@next-lift/authentication/create-auth";

const auth = createAuth({
  database: tursoClient,
  env: {
    BETTER_AUTH_SECRET: env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: env.BETTER_AUTH_URL,
    GOOGLE_CLIENT_ID: env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: env.GOOGLE_CLIENT_SECRET,
    // ... Apple OAuth設定など
  },
  onUserCreated: async (userId) => {
    // 初回サインイン時にPer-User DBを作成
  },
});
```

### Next.js統合

```typescript
import { toNextJsHandler } from "@next-lift/authentication/integrations/better-auth-nextjs";

// app/api/auth/[...all]/route.ts
export const { GET, POST } = toNextJsHandler(auth.handler);
```

### React/Expo統合

```typescript
import { createAuthClient } from "@next-lift/authentication/integrations/better-auth-react";

const authClient = createAuthClient({
  baseURL: publicEnv.NEXT_PUBLIC_APP_URL,
});
```

### Per-User DBクレデンシャルの取得

```typescript
import { getValidCredentials } from "@next-lift/authentication/user-database-credentials";

// 有効なクレデンシャルを取得（期限切れ時は自動更新）
const credentials = await getValidCredentials(userId);
// credentials: { url, authToken }
```

### テストでのモック利用

```typescript
import {
  mockGetValidCredentialsOk,
  mockGetValidCredentialsError,
} from "@next-lift/authentication/testing";

beforeEach(() => {
  mockGetValidCredentialsOk({ url: "libsql://test.turso.io", authToken: "token" });
});
```

## 開発ガイド

### データベーススキーマ

| テーブル | 用途 |
| --- | --- |
| `user` | Better Auth標準。ユーザー情報（email, name等） |
| `account` | OAuthプロバイダー接続（Google, Apple）。user削除時CASCADE |
| `session` | セッショントークン管理。user削除時CASCADE |
| `verification` | メール検証コード |
| `per_user_database` | Per-User DB接続情報。userIdはユニークだが**外部キーなし**（ADR-019: ユーザー削除時もDB情報を保持） |

### Account Linking（ADR-019）

- 同一メールアドレスで異なるプロバイダーからログインした場合、自動的に同一アカウントにリンク
- `trustedProviders: ["google", "apple"]` — メール検証済みプロバイダーのみ自動リンク

### ユーザー削除（ADR-019）

- 認証データのみ削除（user, account, sessionテーブル — CASCADE）
- Per-User Databaseは保持（誤削除時のデータ復旧のため）
- `per_user_database` テーブルにFKを張らない理由: ユーザー削除時にDB情報が消えることを防ぐ

### トークン暗号化

- Per-User DBのJWTトークンをAES-256-GCMで暗号化して保存
- IV: 12バイト、Auth Tag: 16バイト、Base64エンコード: `iv(12) + tag(16) + encrypted`
- 暗号化キー: 環境変数 `TURSO_TOKEN_ENCRYPTION_KEY`（256ビットhex文字列）

### Apple OAuth

- Apple OAuthの `clientSecret` は静的文字列ではなく、ES256 JWTを動的に生成
- 有効期限: 約170日（Appleの上限180日未満）
- form_postコールバックのため `SameSite=None` + `Secure` が必須

### マルチプラットフォーム対応

- **Web（Next.js）**: `nextCookies()` プラグインでCookieベースのセッション管理
- **iOS（Expo）**: `@better-auth/expo` プラグイン + `expo-secure-store` でセッション永続化

### テスト環境

- インメモリSQLite + Drizzle ORMでモック
- `vi.hoisted()` でモック前にDB初期化
- `beforeEach` でテーブルドロップ + マイグレーション再実行
- ファクトリ: `users`, `sessions`, `accounts`, `perUserDatabases`
- 暗号化キーはテスト用の固定値（`"0".repeat(64)`）

