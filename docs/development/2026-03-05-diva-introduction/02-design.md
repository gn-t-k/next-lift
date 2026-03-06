# 設計: @praha/diva 導入による依存解決・テストモックパターン統一

## 概要

`@praha/diva` の `createContext`/`mockContext` を導入し、現在5種類あるモックパターンのうちパターン1〜4を単一パターンに統一する。各パッケージで依存をコンテキストとして定義し、テストでは `mockContext` で差し替え、本番コードでは `withContexts` でプロバイダを設定する。

## 変更の方向性

### 影響範囲

- packages/authentication: `getDatabase()` ヘルパーをコンテキスト化、テストの `vi.mock` を `mockContext` に移行
- packages/turso: `globalThis.fetch` 直接参照をコンテキスト化、テストの `globalThis.fetch = vi.fn()` を `mockContext` に移行
- packages/env: `env` Proxy をコンテキスト化、テストの `vi.mock("@next-lift/env/private")` を `mockContext` に移行
- packages/per-user-database: 上流パッケージの変更に伴うテストモック更新
- apps/web: Server Action・Route Handler のエントリポイントに `withContexts` を追加

### アプローチ

既存モジュールの拡張。段階的に移行する。

#### 全体構造

```
[Entry Point: Server Action / Route Handler]
  └─ withContexts([envProvider, authDatabaseProvider, tursoFetchProvider])
       ├─ auth.api.getSession()  ← authDatabase() で認証DB解決
       ├─ getValidCredentials()  ← authDatabase() で認証DB解決
       └─ createDatabase()       ← tursoFetch() + env.XXX で通信
```

#### A. 認証DB接続（packages/authentication）— 優先度: 高

**現状**: `getDatabase()` ヘルパーが `env` から接続情報を取得し drizzle クライアントを生成

**変更後**:
- `createContext<DrizzleDB>()` で `[authDatabase, withAuthDatabase]` を定義
- `getDatabase()` 呼び出し箇所を `authDatabase()` に置換（6箇所）
- `getDatabase()` 関数自体は `withAuthDatabase` のビルダーとして残す

**テスト移行**:
- `vi.hoisted()` + `vi.mock("../helpers/get-database")` → `mockContext(withAuthDatabase, () => inMemoryDb)`
- `mockContext` はホイスティングと無関係に動作するため、`vi.hoisted()` による動的importは不要になる。通常のトップレベル import に簡略化する
- `setup.ts` の `dropAllTables` + `executeMigrationFiles` の `beforeEach` はテストごとのDB初期化に必要なため維持

#### B. Turso Platform API通信（packages/turso）— 優先度: 中

**現状**: 各機能が `globalThis.fetch` を直接呼び出し、`env` から API トークンを取得

**変更後**:
- `createContext<typeof fetch>()` で `[tursoFetch, withTursoFetch]` を定義
- 4機能（create-database, issue-token, list-databases, delete-database）+ get-database の `globalThis.fetch` → `tursoFetch()`
- `env` 参照はコンテキスト C の対象

**テスト移行**:
- `globalThis.fetch = vi.fn()` + `afterEach` での復元 → `mockContext(withTursoFetch, () => vi.fn())`

#### C. 環境変数（packages/env）— 優先度: 中

**現状**: `env` は Proxy オブジェクトで `process.env` から遅延読込

**変更後**:
- `createContext<PrivateEnv>()` で resolver + provider を定義
- resolver を Proxy でラップし、既存の `env.XXX` アクセスパターンを維持（呼び出し側の変更不要）
- `publicEnv` も同様に Proxy でラップ
- 既存の `parseEnv` をビルダーとして活用

**テスト移行**:
- `vi.hoisted()` + `vi.mock("@next-lift/env/private")` + `createMockEnv` → `mockContext(withEnv, () => ({ ... }))`
- `mockEnv()` / `mockPublicEnv()` を `mockContext` ベースに再実装

**トレードオフ**: Proxy による間接参照が1段増えるが、全パッケージの `env.XXX` 参照を変更せずに済むため差分が最小限になる。

#### E. Server Action層（apps/web）— 優先度: 高

**現状**: Server Action から直接 `auth` (lazy proxy) や CRUD 関数を呼び出し

**変更後**:
- 各 Server Action / Route Handler で `withContexts` を使い、必要なコンテキストのプロバイダを設定
- `auth` の `createLazyProxy` は維持（初期化タイミングの遅延は引き続き有効）
- ただし、`createAuth` 内の `getDatabase()` → `authDatabase()` への変更により、初回アクセス時にコンテキストスコープ内である必要がある

**対象エントリポイント**:
- `/api/auth/[...all]/route.ts` — Better Auth ハンドラ
- `/api/per-user-database/credentials/route.ts` — Per-User DB クレデンシャル
- `/dashboard/_mutations/sign-out.ts`, `delete-account.ts` — 認証操作
- `/auth/sign-in/_mutations/sign-in-with-google.ts`, `sign-in-with-apple.ts` — OAuth

### withContexts の順序

`withContexts` に渡すコンテキスト配列の順序は重要。先に登録されたコンテキストは、後のコンテキストのビルダー内から参照可能。各パッケージが curried provider（ビルダー束縛済み）を export し、apps/web はそれを並べるだけ:

```typescript
withContexts([
  envProvider,              // 1. まず env を解決
  authDatabaseProvider,     // 2. env を使って DB 接続（内部で env.XXX を参照）
  tursoFetchProvider,       // 3. fetch を提供
], async () => {
  // アプリケーションロジック
});
```

### Resolver / Provider の export 方針

`createContext()` が返す `[resolver, provider]` は `helpers/` に定義し、用途に応じて re-export する:

- **curried provider**（ビルダー束縛済み）: `features/` から export → apps/web の `withContexts` で使用
- **raw provider**: `testing/` から re-export → テストの `mockContext(rawProvider, () => mockValue)` で使用
- **resolver**: パッケージ内部の feature が `helpers/` から直接 import。外部パッケージが値を参照する必要がある場合は `features/` からも export

適用例:

- **auth DB**: resolver は内部のみ、curried provider を `features/` から、raw provider を `testing/` から export
- **env**: resolver を Proxy でラップして `env.XXX` のアクセスパターンを維持。Proxy を `features/` から export（他パッケージが `env.XXX` で参照するため）
- **per-user DB**: resolver も curried provider も `features/` から export（アプリケーションから drizzle クエリを直接組み立てるため）

### パターン5（関数パラメータ注入）

変更しない。`createPerUserDatabaseClient(config)` や `now: Date` のような引数による注入は、用途が明確で既存パターンが適切。

## 関連ADR

### 新規ADR: @praha/diva の採用

以下の意思決定を ADR として記録する:

- **決定**: `@praha/diva` を依存解決の標準パターンとして採用
- **ADR-013 との関係**: ADR-013 は「DIパターンの強制」を却下したが、`@praha/diva` は従来の DI（関数パラメータによる注入）とは異なり、AsyncLocalStorage ベースの暗黙的コンテキスト解決を提供する。関数シグネチャは変わらず、テストモックの統一が主目的。ADR-013 の方針と矛盾しない。
- **理由**: モックパターンの統一、認知負荷の低減、`@praha` スコープとの親和性

## 合意事項

- [x] ユーザー承認済み
