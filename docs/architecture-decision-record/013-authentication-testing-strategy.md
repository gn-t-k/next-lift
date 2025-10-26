# ADR-013: 認証モジュールのテスト戦略

## ステータス

Accepted

## コンテキスト

Next Liftの認証機能（Better Auth）のテスト戦略を確立する必要があった。以下の課題があった:

- Better Authインスタンス（`auth`）はグローバルシングルトンとして実装されている
- テストでは、本番DBではなくインメモリDBを使いたい
- 認証機能を使う関数のテスト可能性を確保したい
- テストコードの重複を避け、統一的なテスト環境を提供したい

### 検討した課題

#### 課題1: グローバル`auth`を使う関数のテスト

```typescript
// apps/web/src/lib/user-service.ts
import { auth } from "@next-lift/authentication/instance";

export const getUser = async (userId: string) => {
  return auth.api.getUser({ userId });  // グローバルauthを直接使用
};
```

このような関数をテストする場合、内部で使われる`auth`をテスト用のものに差し替える必要がある。

#### 課題2: テストごとのDB分離

テスト間でDBの状態が共有されると、テストが互いに影響し合い、信頼性が低下する。各テストで独立したDBを使いたい。

#### 課題3: Better Auth公式テストキットとの統合

Better Authは公式テストユーティリティ（`better-auth/test`の`getTestInstance`）を提供している。これを活用しつつ、プロジェクト固有の設定（`createDatabase`の使用など）も組み込みたい。

## 決定内容

以下のテスト戦略を採用する:

### 1. `createTestAuth`関数の提供

`@next-lift/authentication`パッケージが、テスト用authインスタンス作成関数を提供する（実装: [test-helpers.ts](../../packages/authentication/src/test-helpers.ts)）。

この関数は、インメモリDBを使ったBetter Authインスタンスを返す。

**利用方法**:

```typescript
// apps/web/test/auth.test.ts
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

### 2. グローバル`auth`を使う関数のテスト方針

#### 方針A: 統合テストとして書く（推奨）

グローバル`auth`を使う関数は、実際のauth（インメモリDB）を使って統合テストとして検証する。

```typescript
// apps/web/test/user-service.test.ts
import { getUser } from "../src/lib/user-service";
import { createTestAuth } from "@next-lift/authentication/test-helpers";

describe("User Service (統合テスト)", () => {
  let testAuth;

  beforeEach(async () => {
    testAuth = await createTestAuth();
    // テストデータをセットアップ
    await testAuth.api.signUp.email({
      email: "test@example.com",
      password: "password",
      name: "Test User",
    });
  });

  it("ユーザーを取得できる", async () => {
    // getUser内部で使われるauthは、環境変数でインメモリDBを使うように設定
    const user = await getUser("...");
    expect(user).toBeDefined();
  });
});
```

**注意**: この方法では、環境変数でauthenticationパッケージのDBをインメモリまたはファイルDBに切り替える必要がある。

#### 方針B: DIパターンへのリファクタリング（必要に応じて）

テストのためにDI（依存性注入）パターンを導入することも可能。

```typescript
// apps/web/src/lib/user-service.ts
import type { Auth } from "@next-lift/authentication/better-auth";
import { auth as defaultAuth } from "@next-lift/authentication/instance";

export const createUserService = (auth: Auth = defaultAuth) => ({
  getUser: async (userId: string) => {
    return auth.api.getUser({ userId });
  },
});

// デフォルトインスタンス（本番用）
export const userService = createUserService();
```

```typescript
// apps/web/test/user-service.test.ts
import { createUserService } from "../src/lib/user-service";
import { createTestAuth } from "@next-lift/authentication/test-helpers";

describe("User Service", () => {
  it("ユーザーを取得できる", async () => {
    const testAuth = await createTestAuth();
    const userService = createUserService(testAuth);  // テスト用authを注入

    const user = await userService.getUser("...");
    expect(user).toBeDefined();
  });
});
```

**トレードオフ**:

- メリット: テスト可能性が高い、依存関係が明示的
- デメリット: コードが冗長になる、「外から渡す制約」が生まれる

### 3. テスト設定の一元管理

テスト用authの設定（`secret`、`emailAndPassword`、`rateLimit`など）は、[test-helpers.ts](../../packages/authentication/src/test-helpers.ts)で一元管理する。

これにより:

- 利用側でボイラープレートを書く必要がない
- テスト設定を変更する際、1箇所を修正すればよい
- プロジェクト全体で統一されたテスト環境を保証できる

## 結果・影響

### メリット

1. **テストコードがシンプル**
   - `createTestAuth()`を呼ぶだけでテスト用authインスタンスが作成できる
   - ボイラープレートを毎回書く必要がない

2. **設定の一元管理**
   - テスト用auth設定が`authentication`パッケージに集約される
   - 設定変更の影響範囲が明確

3. **`createDatabase`の活用**
   - プロジェクト全体で統一されたDB作成方法を使える
   - 将来的にDB設定を変更する際も一箇所を修正すればよい

4. **柔軟性**
   - 方針A（統合テスト）と方針B（DIパターン）を状況に応じて使い分けられる
   - 必要に応じてカスタマイズ可能

### デメリット・制約

1. **グローバル`auth`のテスト**
   - 方針Aでは環境変数での切り替えが必要
   - 方針Bではコードの複雑さが増す

2. **authenticationパッケージの責務増加**
   - テストヘルパーの提供も責務に含まれる
   - ただし、認証機能を提供するパッケージとして適切

## 代替案

以下の選択肢を検討し、却下した:

### vitestのモック機能を使う

```typescript
vi.mock("@next-lift/authentication/instance", async (importOriginal) => {
  const original = await importOriginal();
  const testDb = createDatabase({ type: "memory" });
  return {
    ...original,
    database: testDb,
  };
});
```

**却下理由**:

- 実装が複雑すぎる（ESモジュールの静的初期化への対応が困難）
- authenticationパッケージの内部実装に強く依存する
- テスト間の分離が難しい
- メンテナンスコストが高い

### DIパターンを強制する

すべての関数でauthを外部から注入する設計にする。

**却下理由**:

- 「外から渡す制約」が常に存在する
- コードが冗長になる
- グローバルシングルトンのシンプルさが失われる
- 個人開発プロジェクトでは過剰

### Better Auth公式の`getTestInstanceMemory`のみを使う

```typescript
import { getTestInstanceMemory } from "better-auth/test";

const ctx = await getTestInstanceMemory({
  emailAndPassword: { enabled: true },
}, {
  testWith: "memory",
});
```

**却下理由**:

- `createDatabase`が使えない
- プロジェクト固有のDB設定が活かせない
- テスト設定が利用側に散らばる

## 決定日

2025-10-26
