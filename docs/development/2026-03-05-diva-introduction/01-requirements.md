# 要件定義: @praha/diva 導入による依存解決・テストモックパターン統一

GitHub Issue: #563

## 要望（Goals）

- テストを書く際に「この依存はどのパターンでモックするか」を都度判断する認知負荷をなくしたい
- 依存解決とモック差し替えのパターンを統一し、コードベースの一貫性を高めたい

## 要求（Requests）

- `@praha/diva` を導入し、現在5種類あるモックパターンのうちパターン1〜4を `createContext` / `mockContext` の単一パターンに統一する
- パターン5（関数パラメータ注入）はそのまま残す
- 優先度に従って段階的にリファクタリングする

## 調査結果

### コードベース調査

#### 現在のモックパターン（5種類）

| # | パターン | 使用箇所 | テストでの差し替え方 |
|---|---------|---------|----------------------|
| 1 | `env.XXX` グローバルProxy参照 | turso, authentication, per-user-database | `vi.mock("@next-lift/env/private")` + `createMockEnv` |
| 2 | `getDatabase()` ヘルパー関数呼び出し | authentication内のCRUD全般 | `vi.mock("../helpers/get-database")` + インメモリDB |
| 3 | `globalThis.fetch` グローバル参照 | tursoパッケージ（Platform API通信） | `globalThis.fetch = vi.fn()` |
| 4 | 他パッケージの関数をdirect import | `createDatabase()`, `issueToken()` 等 | `vi.spyOn(module, "fn")` |
| 5 | 関数パラメータ | `createPerUserDatabaseClient(config)`, `now: Date` | 引数にモック値を渡す |

### 外部調査

#### @praha/diva（v1.0.2）

- Node.js `AsyncLocalStorage` ベースの軽量DIライブラリ
- `createContext<T>()` → `[Resolver, Provider]` タプルを返す
- `withContexts` で複数プロバイダをまとめて適用可能
- `@praha/diva/test` の `mockContext` でプロバイダスコープなしにモック注入可能
- 同じ `@praha` スコープ（`@praha/drizzle-factory` 等）でプロジェクトとの親和性が高い

#### 統一後のイメージ

```typescript
// Before（4種類のモックパターン）
vi.mock("@next-lift/env/private")       // env変数
vi.mock("../helpers/get-database")       // 認証DB
globalThis.fetch = vi.fn()               // HTTP
vi.spyOn(module, "fn")                   // パッケージ間関数

// After（diva統一）
mockContext(withXxx, () => mockImpl)      // 全依存を統一
```

#### 構造的制約

- Server Actionごとに `withContexts` の呼び出しは必須
  - 各Server Actionは独立したリクエストのため、Middlewareでの一括設定は不可（Edge Runtime vs Node.jsでAsyncLocalStorageのスコープが異なる）

## 要件（Requirements）

### 機能要件

1. `@praha/diva`（v1.0.2）をプロジェクトに導入する
2. 以下の優先順位で段階的にリファクタリングする

**優先度: 高**
- **A. 認証DB接続（`getDatabase()`）**: `packages/authentication` の `getDatabase` を diva context 化。影響範囲: `save/get/refresh/delete UserDatabaseCredentials` + `createAuth` の5箇所
- **E. Server Action層**: `apps/web` の Server Action で `withContexts` による認証セッション + Per-User DBクライアントのスコープ化

**優先度: 中**
- **B. Turso Platform API通信（fetch + env）**: `packages/turso` の4機能で `globalThis.fetch` 直接書き換えを廃止
- **C. 環境変数（`env`）**: `packages/env` の private/public を diva context 化

**優先度: 低**
- **D. パッケージ間の関数依存**: 現状の `vi.spyOn` パターンが十分に確立されているため、後回し

3. パターン5（関数パラメータ注入）は変更しない

### 非機能要件

- 各段階で既存テストが全てパスすること
- `pnpm type-check && pnpm lint && pnpm test && pnpm build` が全てパスすること
- ADR-013（統合テスト優先）との整合性を維持すること

## 合意事項

- [x] ユーザー承認済み
