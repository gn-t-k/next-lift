#!/bin/bash
gh issue create \
  --title "全パッケージ — @praha/diva を導入して依存解決・テストモックパターンを統一する" \
  --body "$(cat <<'EOF'
## パッケージ / 対象

全パッケージ（`packages/turso`, `packages/authentication`, `packages/per-user-database`, `packages/env`, `apps/web`）

## 問題

現在、依存解決とテスト時のモック差し替えに5種類のパターンが混在しており、テストを書く際に「この依存はどのパターンでモックするか」を都度判断する認知負荷がある。

### 現状の依存解決パターン

| # | パターン | 使用箇所 | テストでの差し替え方 |
|---|---------|---------|-------------------|
| 1 | `env.XXX` グローバルProxy参照 | turso, authentication, per-user-database | `vi.mock("@next-lift/env/private")` + `createMockEnv` |
| 2 | `getDatabase()` ヘルパー関数呼び出し | authentication内のCRUD全般 | `vi.mock("../helpers/get-database")` + インメモリDB |
| 3 | `globalThis.fetch` グローバル参照 | tursoパッケージ（Platform API通信） | `globalThis.fetch = vi.fn()` |
| 4 | 他パッケージの関数をdirect import | `createDatabase()`, `issueToken()` 等 | `vi.spyOn(module, "fn")` |
| 5 | 関数パラメータ | `createPerUserDatabaseClient(config)`, `now: Date` | 引数にモック値を渡す |

`@praha/diva` を導入することで、パターン1〜4を `createContext` / `mockContext` の単一パターンに統一できる。パターン5（パラメータ注入）はそのまま残す。

## 修正内容

`@praha/diva` を導入し、以下の優先順位で段階的にリファクタリングする。

### 優先度: 高

**A. 認証DB接続（`getDatabase()`）**
- 対象: `packages/authentication/src/helpers/get-database.ts`
- 影響範囲: `save/get/refresh/delete UserDatabaseCredentials` + `createAuth` の全5箇所
- 現状の `vi.hoisted` + `vi.mock` の複雑なセットアップが `mockContext` 1行に統一される

**E. Server Action層（認証 + DB接続の取得）**
- 対象: `apps/web/src/app/dashboard/_mutations/*.ts` 等
- 影響範囲: 現在5箇所、今後増加
- `withAuthenticated` ヘルパーとして `withContexts` で認証セッション + Per-User DBクライアントをスコープ化
- Server Actionのテストが書きやすくなる（現状ほぼテストなし）

### 優先度: 中

**B. Turso Platform API通信（fetch + env）**
- 対象: `packages/turso/src/features/` 配下の全4機能
- `globalThis.fetch` の直接書き換え（副作用あり）が不要になる

**C. 環境変数（`env`）**
- 対象: `packages/env/src/features/private/private.ts`, `public.ts`
- 全パッケージが依存。ただし現状の `mockPrivateEnv` も十分機能している

### 優先度: 低

**D. パッケージ間の関数依存（createDatabase, issueToken 等）**
- 対象: per-user-database → turso, authentication → turso
- 現状の `vi.spyOn` パターンが十分に確立されている

### 統一後のイメージ

```typescript
// Before（5種類のモックパターン）
vi.mock("@next-lift/env/private")       // env変数
vi.mock("../helpers/get-database")       // 認証DB
globalThis.fetch = vi.fn()               // HTTP
vi.spyOn(module, "fn")                   // パッケージ間関数

// After（diva統一）
mockContext(withXxx, () => mockImpl)      // 全依存を統一
```

### ADR-013（統合テスト優先）との整合性

diva は統合テストとも相性が良い。統合テストでは「本物のDBクライアント」を注入し、単体テストでは「モック」を注入するという使い分けが context の差し替えだけでできる。

### 構造的制約（調査で判明）

- Server Actionごとに `withAuthenticated`（divaスコープのセットアップ）の呼び出しは必須
  - 各Server Actionは独立したリクエストのため、Middlewareでの一括設定は不可（Edge Runtime vs Node.jsでAsyncLocalStorageのスコープが異なる）

## 対象ファイル

- `packages/authentication/src/helpers/get-database.ts`
- `packages/authentication/src/features/user-database-credentials/*.ts`
- `packages/authentication/src/testing/setup.ts`
- `packages/turso/src/features/*/` 配下の全機能
- `packages/per-user-database/src/features/create-database/create-turso-per-user-database.ts`
- `packages/env/src/features/private/private.ts`
- `packages/env/src/features/public/public.ts`
- `apps/web/src/app/dashboard/_mutations/*.ts`
- `apps/web/src/app/auth/sign-in/_mutations/*.ts`
- `apps/web/src/app/api/per-user-database/credentials/route.ts`

## 検証方法

- 各段階で `pnpm test` が全パスすること
- `pnpm type-check` がパスすること
- `pnpm lint` がパスすること
- `pnpm build` が成功すること
EOF
)" \
  --label "refactor,priority:medium"
