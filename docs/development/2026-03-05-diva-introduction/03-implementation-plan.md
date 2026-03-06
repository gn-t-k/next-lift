# 実装計画: @praha/diva 導入による依存解決・テストモックパターン統一

## タスク一覧

### 優先度: 高 — A. 認証DB接続（packages/authentication）

#### タスク1: `@praha/diva` パッケージをインストール

- 内容:
  - `packages/authentication` に `@praha/diva` を dependencies として追加
  - `pnpm add @praha/diva@<latest> --filter @next-lift/authentication`
- 検証方法: 型チェック
- 依存: なし

#### タスク2: `authDatabase` コンテキストを定義し、curried provider を公開する

- 内容:
  - `helpers/auth-database-context.ts` を新規作成:
    - `createContext<DrizzleDB>()` で `[authDatabase, withAuthDatabase]` を定義
    - パッケージ内部からのみ import される（package.json exports には追加しない）
  - `features/auth-database/auth-database.ts` を新規作成:
    - `authDatabase` resolver を re-export（パッケージ内部の他 feature が使用）
    - `authDatabaseProvider` curried provider を定義・export（`withAuthDatabase(() => getDatabase())`）
  - `testing/index.ts` に `withAuthDatabase` raw provider の re-export を追加（テストの `mockContext` 用）
  - `package.json` の `exports` に以下を追加:
    - `"./auth-database"`: curried provider の公開（apps/web 用）
    - `"./testing"` は既存エントリに raw provider の re-export を含める
- 検証方法: 型チェック
- 依存: タスク1

#### タスク3: テストの `setup.ts` を `mockContext` ベースに移行する

- 内容:
  - `packages/authentication/src/testing/setup.ts` を修正:
    - `vi.mock("../helpers/get-database", ...)` → `mockContext(withAuthDatabase, () => mockedAuthenticationDatabase)`
    - `import { mockContext } from "@praha/diva/test"` を追加
  - `vi.hoisted()` を除去し、通常のトップレベル import に簡略化する
    - `vi.hoisted()` は `vi.mock` のホイスティング対策として必要だったが、`mockContext` はホイスティングと無関係なため不要になる
    - `await vi.hoisted(async () => { const { createClient } = await import("@libsql/client"); ... })` → 通常の `import { createClient } from "@libsql/client"` に変更
  - `dropAllTables` + `executeMigrationFiles` の `beforeEach` はテストごとのDB初期化に必要なため維持
- 検証方法: タスク4完了後にテスト（この時点では実装側が未変更のため失敗する）
- 依存: タスク2

#### タスク4: `getDatabase()` の呼び出し箇所を `authDatabase()` に置換する

- 内容:
  - 以下の5ファイルで `getDatabase()` → `authDatabase()` に置換:
    1. `packages/authentication/src/features/instance/create-auth.ts`
    2. `packages/authentication/src/features/user-database-credentials/save-user-database-credentials.ts`
    3. `packages/authentication/src/features/user-database-credentials/get-user-database-credentials.ts`
    4. `packages/authentication/src/features/user-database-credentials/refresh-user-database-token.ts`
    5. `packages/authentication/src/features/user-database-credentials/delete-user-database-credentials.ts`
  - 各ファイルは `helpers/auth-database-context.ts` または `features/auth-database/auth-database.ts` から `authDatabase` を import する
  - `getDatabase()` ヘルパー関数自体は削除しない（curried provider のビルダーとして使用するため）
- 検証方法: テスト（`pnpm test --filter @next-lift/authentication`）
- 依存: タスク3

### 優先度: 高 — E. Server Action層（apps/web）

#### タスク5: `apps/web` に `@praha/diva` パッケージをインストール

- 内容:
  - `pnpm add @praha/diva@<latest> --filter @next-lift/web`
- 検証方法: 型チェック
- 依存: タスク4

#### タスク6: Better Auth Route Handler に `withContexts` を追加する

- 内容:
  - 対象: `apps/web/src/app/api/auth/[...all]/route.ts`
  - `GET`/`POST` ハンドラの呼び出しを `withContexts([authDatabaseProvider], ...)` でラップ
  - `createLazyProxy` は維持
- 検証方法: ビルド確認 + 手動でサインインフローの動作確認
- 依存: タスク5

#### タスク7: Per-User DB credentials Route Handler に `withContexts` を追加する

- 内容:
  - 対象: `apps/web/src/app/api/per-user-database/credentials/route.ts`
  - `GET` ハンドラを `withContexts([authDatabaseProvider], ...)` でラップ
- 検証方法: ビルド確認 + 手動で Per-User DB クレデンシャル取得の動作確認
- 依存: タスク6

#### タスク8: Dashboard mutations に `withContexts` を追加する

- 内容:
  - 対象:
    1. `apps/web/src/app/dashboard/_mutations/sign-out.ts`
    2. `apps/web/src/app/dashboard/_mutations/delete-account.ts`
  - Server Action の本体を `withContexts([authDatabaseProvider], ...)` でラップ
- 検証方法: ビルド確認 + 手動でサインアウト・アカウント削除の動作確認
- 依存: タスク6

#### タスク9: Sign-in mutations に `withContexts` を追加する

- 内容:
  - 対象:
    1. `apps/web/src/app/auth/sign-in/_mutations/sign-in-with-google.ts`
    2. `apps/web/src/app/auth/sign-in/_mutations/sign-in-with-apple.ts`
  - Server Action の本体を `withContexts([authDatabaseProvider], ...)` でラップ
- 検証方法: ビルド確認 + 手動で Google/Apple サインインの動作確認
- 依存: タスク6

#### タスク10: 全体検証（優先度: 高 完了確認）

- 内容:
  - `pnpm type-check && pnpm lint && pnpm test && pnpm build` を全て実行
  - 特に: `packages/authentication` の全テスト、`apps/web` のビルド、`packages/per-user-database` のテスト
- 検証方法: 全コマンドがパスすること
- 依存: タスク7, タスク8, タスク9

### 優先度: 中 — B. Turso Platform API通信（packages/turso）

#### タスク11: `@praha/diva` を `packages/turso` にインストール

- 内容:
  - `pnpm add @praha/diva@<latest> --filter @next-lift/turso`
- 検証方法: 型チェック
- 依存: タスク10

#### タスク12: `tursoFetch` コンテキストを定義し、curried provider を公開する

- 内容:
  - `helpers/turso-fetch-context.ts` を新規作成:
    - `createContext<typeof fetch>()` で `[tursoFetch, withTursoFetch]` を定義
  - `features/turso-fetch/turso-fetch.ts` を新規作成:
    - `tursoFetch` resolver を re-export（パッケージ内部の他 feature が使用）
    - `tursoFetchProvider` curried provider を定義・export（`withTursoFetch(() => globalThis.fetch)`）
  - `testing/index.ts` に `withTursoFetch` raw provider の re-export を追加
  - `package.json` の `exports` に `"./turso-fetch"` を追加
- 検証方法: 型チェック
- 依存: タスク11

#### タスク13: テストファイルを `mockContext` ベースに移行する（turso）

- 内容:
  - 4つのテストファイルで `globalThis.fetch = mockFetch` → `mockContext(withTursoFetch, () => mockFetch)` に移行:
    1. `packages/turso/src/features/create-database/create-database.test.ts`
    2. `packages/turso/src/features/issue-token/issue-token.test.ts`
    3. `packages/turso/src/features/list-databases/list-databases.test.ts`
    4. `packages/turso/src/features/delete-database/delete-database.test.ts`
  - `afterEach` での `globalThis.fetch` 復元処理を削除
- 検証方法: タスク14完了後にテスト
- 依存: タスク12

#### タスク14: 実装ファイルの `fetch` を `tursoFetch()` に置換する（turso）

- 内容:
  - 5ファイルで `fetch(...)` → `tursoFetch()(...)` に置換:
    1. `packages/turso/src/features/create-database/create-database.ts`
    2. `packages/turso/src/features/create-database/get-database.ts`
    3. `packages/turso/src/features/issue-token/issue-token.ts`
    4. `packages/turso/src/features/list-databases/list-databases.ts`
    5. `packages/turso/src/features/delete-database/delete-database.ts`
- 検証方法: テスト（`pnpm test --filter @next-lift/turso`）
- 依存: タスク13

#### タスク15: `apps/web` の `withContexts` に `tursoFetchProvider` を追加する

- 内容:
  - タスク6〜9で追加した6つのエントリポイントの `withContexts` に `tursoFetchProvider` を追加
  - `setupPerUserDatabase` が `createDatabase` + `issueToken` を内部で呼ぶため、サインイン関連の全エントリポイントでも必要
- 検証方法: ビルド確認
- 依存: タスク14

### 優先度: 中 — C. 環境変数（packages/env）

#### タスク16: `@praha/diva` を `packages/env` にインストール

- 内容:
  - `pnpm add @praha/diva@<latest> --filter @next-lift/env`
- 検証方法: 型チェック
- 依存: タスク15

#### タスク17: `env` / `publicEnv` コンテキストを定義する

- 内容:
  - 既存の `private.ts` で `createContext<PrivateEnv>()` を使い resolver + provider を定義
  - resolver を Proxy でラップして `env.XXX` のアクセスパターンを維持（呼び出し側の変更不要）
  - `envProvider` curried provider を export
  - `public.ts` も同様に Proxy ラップ + `publicEnvProvider` を export
  - `testing/` に `withEnv` / `withPublicEnv` raw provider の re-export を追加
  - `package.json` の `exports` は既存の `"./private"` / `"./public"` エントリをそのまま使う
- 検証方法: 型チェック
- 依存: タスク16

#### タスク18: `packages/turso` のテストモックを `mockContext` に移行する

- 内容:
  - 実装ファイルの `env.XXX` 参照は変更不要（Proxy で互換性維持）
  - テストの `mockEnv(...)` → `mockContext(withEnv, () => ({ ... }))` に移行
- 検証方法: テスト（`pnpm test --filter @next-lift/turso`）
- 依存: タスク17

#### タスク19: `packages/authentication` のテストモックを `mockContext` に移行する

- 内容:
  - 実装ファイルの `env.XXX` 参照は変更不要（Proxy で互換性維持）
  - テストの `setup.ts` で `mockEnv` → `mockContext(withEnv, ...)` に移行
- 検証方法: テスト（`pnpm test --filter @next-lift/authentication`）
- 依存: タスク18

#### タスク20: `packages/per-user-database` のテストモックを `mockContext` に移行する

- 内容:
  - 実装ファイルの `env.XXX` 参照は変更不要（Proxy で互換性維持）
  - テストの `setup.ts` で `mockEnv` → `mockContext(withEnv, ...)` に移行
  - `@praha/diva` を devDependencies に追加（テストで `mockContext` を使うため）
- 検証方法: テスト（`pnpm test --filter @next-lift/per-user-database`）
- 依存: タスク18

#### タスク21: `apps/web` の `withContexts` に `envProvider` を追加する

- 内容:
  - 6つのエントリポイントの `withContexts` に `envProvider` を最初に配置
  - コンテキスト順序: `envProvider` → `authDatabaseProvider` → `tursoFetchProvider`
  - `authDatabaseProvider` のビルダー内で env Proxy 経由でDB接続情報を取得
- 検証方法: ビルド確認
- 依存: タスク19, タスク20

### 共通タスク

#### タスク22: ADR を記録する

- 内容:
  - `docs/architecture-decision-record/` に `@praha/diva` 採用の ADR を作成
  - 決定: `@praha/diva` を依存解決の標準パターンとして採用
  - ADR-013 との関係: 矛盾しない理由を記述
- 検証方法: コードレビュー
- 依存: なし（実装と並行可能）

#### タスク23: 全体検証（最終）

- 内容:
  - `pnpm type-check && pnpm lint && pnpm test && pnpm build` を全て実行
  - `vi.mock("../helpers/get-database")` や `globalThis.fetch = vi.fn()` パターンが残っていないことを確認
- 検証方法: 全コマンドがパスすること
- 依存: タスク21, タスク22

## 設計上の注意点

### `vi.hoisted()` の除去

`vi.hoisted()` は `vi.mock` のホイスティング対策として必要だった。`mockContext` はホイスティングと無関係に動作するため、`vi.hoisted()` と動的 import は不要になり、通常のトップレベル import に簡略化できる。

### `withContexts` のプロバイダ順序

curried provider を使用。順序は依存関係で決まる:

1. `envProvider` — 他のコンテキストが env を参照するため最初
2. `authDatabaseProvider` — 内部で `env.XXX` を使ってDB接続
3. `tursoFetchProvider` — 独立、順序不問だが最後

## 検証方法の選択基準

1. **型チェック**: 関数シグネチャ、型定義の変更、パッケージ exports の追加
2. **テスト**: モックパターン移行の回帰確認（既存テストがパスすること）
3. **手動確認**: Server Action / Route Handler の動作確認（認証フロー、Per-User DB操作）

## 合意事項

- [x] ユーザー承認済み
