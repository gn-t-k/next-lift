# Testing Guide

このドキュメントでは、`@next-lift/auth-database` を使用したアプリケーション（`apps/web`、`apps/ios`）でテストを書く際のベストプラクティスを説明します。

## テスト戦略

### 基本方針

- **認証機能のテストは統合テストとして実施する**
  - Better Auth APIを通してのみデータ操作を行う
  - データベースの実装詳細には依存しない
- **インメモリデータベースを使用する**
  - テストの高速化
  - テスト間の分離を保証
  - 外部サービスへの依存を排除

### auth-databaseパッケージの責務

このパッケージは以下を提供します：

- `auth`: 本番環境用のBetter Authインスタンス
- `createDatabase`: テスト用インメモリデータベース作成関数

データベーススキーマや直接的なDB操作関数はexportしません。すべての操作は `auth` インスタンスを通して行います。

## テストの書き方

### 推奨: @better-auth-kit/tests を使用

`@better-auth-kit/tests` は、Better Auth公式のテストユーティリティパッケージです。テスト用インスタンスの作成やテストユーザーの管理を簡単に行えます。

#### 1. 必要なパッケージのインストール

```bash
pnpm add -D @better-auth-kit/tests vitest
```

#### 2. テストヘルパーの作成

```typescript
// test/auth.test-setup.ts
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getTestInstance } from "@better-auth-kit/tests";
import { createDatabase } from "@next-lift/auth-database";

export async function createAuthTestContext() {
  // インメモリデータベースを作成
  const db = createDatabase({ type: "memory" });

  // テスト用Better Authインスタンスを作成
  const auth = betterAuth({
    database: drizzleAdapter(db, {
      provider: "sqlite",
    }),
    secret: "test-secret",
    emailAndPassword: { enabled: true },
    // テスト用の設定
    rateLimit: { enabled: false },
    advanced: { disableCSRFCheck: true },
  });

  // @better-auth-kit/testsでラップ
  return await getTestInstance(auth);
}
```

#### 3. テストの実装

```typescript
// test/auth.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { createAuthTestContext } from "./auth.test-setup";

describe("認証フロー", () => {
  let ctx: Awaited<ReturnType<typeof createAuthTestContext>>;

  beforeEach(async () => {
    // 各テストで新しいコンテキストを作成（テスト間の分離）
    ctx = await createAuthTestContext();
  });

  it("デフォルトのテストユーザーでログインできる", async () => {
    const { user } = await ctx.signInWithTestUser();
    expect(user.email).toBe("test@example.com");
  });

  it("新しいユーザーを登録できる", async () => {
    const result = await ctx.client.signUp.email({
      email: "newuser@example.com",
      password: "password123",
      name: "New User",
    });

    expect(result.data?.user.email).toBe("newuser@example.com");
  });
});
```

### 代替案: Better Authを直接使用

`@better-auth-kit/tests` を使わない場合でも、インメモリデータベースを使ってテストできます。

```typescript
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createDatabase } from "@next-lift/auth-database";

// テスト用authインスタンスを作成
const testDb = createDatabase({ type: "memory" });
const testAuth = betterAuth({
  database: drizzleAdapter(testDb, { provider: "sqlite" }),
  secret: "test-secret",
  // その他の設定...
});

// testAuthを使ってテストを実施
```

## 重要なポイント

### 1. テスト間の分離

各テストで新しいインメモリデータベースを作成することで、テスト間の状態汚染を防ぎます。

```typescript
beforeEach(async () => {
  // 毎回新しいコンテキストを作成
  ctx = await createAuthTestContext();
});
```

### 2. Better Auth APIを使用

データベースを直接操作せず、必ずBetter AuthのAPIを通してデータ操作を行います。

```typescript
// ❌ 悪い例: データベースを直接操作
await db.insert(userTable).values({ ... });

// ✅ 良い例: Better Auth APIを使用
await ctx.client.signUp.email({ ... });
```

### 3. テスト用設定の有効化

テストでは以下の設定を推奨します：

- `rateLimit: { enabled: false }`: レート制限を無効化
- `advanced: { disableCSRFCheck: true }`: CSRF チェックを無効化

## 参考資料

- [Better Auth公式ドキュメント](https://www.better-auth.com/docs)
- [@better-auth-kit/tests](https://www.better-auth-kit.com/docs/libraries/tests)
- [Drizzle ORM](https://orm.drizzle.team/)
- [libSQL Client](https://docs.turso.tech/sdk/ts/reference)
