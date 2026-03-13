# Breakdown: @praha/diva 導入による依存解決・テストモックパターンの統一

## ステータス

- 状態: 確定
- 現在のフェーズ: 4/5（リファクタリング）
- 最終更新: 2026-03-13

## 要件サマリー

- 要件ドキュメント: `docs/development/2026-03-11-diva-introduction/01-requirements.md`
- スコープ: FR1〜FR7（diva導入、ADR追記、認証DB→環境変数→Turso API→パッケージ間依存→Server Action層の段階的リファクタリング）
- GitHub Issue: #563

## 設計概要

### 影響範囲

- apps/web: Server Action層にwithAuthenticatedヘルパー導入
- packages/env: divaコンテキスト化（Proxyでenv.XXXパターン維持）
- packages/authentication: getDatabase()のdiva化、統合テストのmockContext移行
- packages/turso: TursoApiClientコンテキスト（fetch + baseURL + auth を内包するファクトリ関数）
- packages/per-user-database: パッケージ間依存のdiva化

### アプローチ

- 既存パッケージの段階的リファクタリング（env → auth DB → turso → パッケージ間依存 → Server Action層）
- 既存のmockXxxOk/mockXxxErrorインターフェースを維持し、内部実装のみmockContextに変更

### エクスポートパターン（全パッケージ共通）

`createContext()` が返す `[resolver, provider]` は `helpers/` に定義し、用途に応じて re-export:

- **curried provider**（ビルダー束縛済み）: `features/` から export → apps/web の `withContexts` で使用
- **raw provider**: `testing/` から re-export → テストの `mockContext(rawProvider, () => mockValue)` で使用（外部パッケージからモックが必要な場合のみ。tursoパッケージのように内部HTTPクライアントのDIであり外部からモック不要な場合はre-exportしない）
- **resolver**: パッケージ内部の feature が `helpers/` から直接 import。外部パッケージが値を参照する必要がある場合は `features/` からも export

### 関連ADR

- `docs/architecture-decision-record/013-authentication-testing-strategy.md` — Amendment予定（「DIを避ける」方針を撤回）

## タスクツリー

凡例:
- `[?]` 未展開（さらに分解が必要）
- `[ ]` 葉タスク（TDDで着手可能）
- `[x]` 完了

依存関係: 上から順に実装する。同じ階層内で依存がない場合は並行実装可能。

### 1. 基盤整備（FR1 + FR2）

- [ ] 1.1. @praha/diva のインストール
  - 説明: env, authentication, turso, per-user-database, apps/web に `@praha/diva` を追加する
  - 完了条件:
    - 型: 各パッケージで `import { createContext, withContexts, mockContext } from "@praha/diva"` が型エラーなくインポートできること

- [ ] 1.2. ADR-013のAmendment
  - 説明: ADR-013に追記セクションを追加し、diva導入により「DIを避ける」方針を撤回する旨を記録する
  - 完了条件:
    - 確認: ADR-013にAmendmentセクションが追加され、diva導入の経緯と方針変更が記録されていること

### 2. 環境変数のdiva化（FR5）

依存関係: 2.1 → 2.2 → 2.3 の順。

- [ ] 2.1. private envのdivaコンテキスト化
  - 説明: helpers/にprivate envのcreateContextを定義し、features/private/private.tsのexportをresolver + Proxyに置き換える。testing/にraw providerをre-exportする
  - 完了条件:
    - テスト: resolver経由でenv.XXXの値が取得できること
    - 型: 既存の `env.TURSO_PLATFORM_API_TOKEN` 等のアクセスパターンが型エラーなく使えること

- [ ] 2.2. public envのdivaコンテキスト化
  - 説明: 2.1と同様の構造でpublic envをdiva化する
  - 完了条件:
    - テスト: resolver経由でpublicEnv.XXXの値が取得できること
    - 型: 既存の `publicEnv.NEXT_PUBLIC_APP_URL` 等のアクセスパターンが型エラーなく使えること

- [ ] 2.3. mockPrivateEnv/mockPublicEnvのmockContext化
  - 説明: vi.hoisted + vi.mockベースのモック実装をmockContextに置き換える。mockPrivateEnv/mockPublicEnvの呼び出しインターフェースは維持する
  - 完了条件:
    - テスト: env, turso, authentication, per-user-databaseの全テストがパスすること

### 3. 認証DB接続のdiva化（FR3）

依存関係: 3.1 → 3.2 → 3.3 の順。

- [ ] 3.1. authentication databaseコンテキストの作成
  - 説明: helpers/にdatabaseのcreateContextを定義する。resolverはgetDatabase()と同等の処理（env→libsqlクライアント→drizzleインスタンス生成）を行う。testing/にraw providerをre-exportする
  - 完了条件:
    - 型: resolveDatabaseが `ReturnType<typeof drizzle>` 相当の型を返すこと

- [ ] 3.2. getDatabase()をresolverに置き換え
  - 説明: authentication内のgetDatabase()呼び出しをresolveDatabaseに置き換える。createAuth, CRUD関数等が対象。curried providerをfeatures/からexportする
  - 完了条件:
    - 型: 型チェックが通ること

- [ ] 3.3. 統合テストのセットアップをmockContext化
  - 説明: testing/setup.tsのvi.hoisted + vi.mock（getDatabase→インメモリDB）をmockContext(databaseProvider, () => inMemoryDb)に置き換える
  - 完了条件:
    - テスト: authentication内の全テスト（save/get/refresh/delete UserDatabaseCredentials, createAuth）がパスすること

### 4. Turso Platform API通信のdiva化（FR4）

依存関係: 4.1 → 4.2 → 4.3 → 4.4 の順。

- [ ] 4.1. TursoApiClientコンテキストの作成
  - 説明: turso/helpers/にTursoApiClientのcreateContextとファクトリ関数を定義する。
    ファクトリ関数はenv.TURSO_PLATFORM_API_TOKEN, env.TURSO_ORGANIZATIONとglobalThis.fetchを
    直接使用し、get/post/deleteメソッドを持つオブジェクトを返す。
    helpers/にmockファイルを作成する（withTursoApiは内部DIのためtesting/からのre-exportは不要）
  - 完了条件:
    - 型: getTursoApiがTursoApiClient型を返すこと
    - 型: mockTursoApiがmockGet/mockPost/mockDeleteを返すこと

- [ ] 4.2. tursoの実装をTursoApiClient経由に移行
  - 説明: listDatabases, deleteDatabase, getDatabase, createDatabase, issueTokenの
    getFetch+getTursoEnv呼び出しをgetTursoApi経由に変更する。
    URL構築・Authorizationヘッダー付与のロジックを削除する
  - 完了条件:
    - 型: 型チェックが通ること

- [ ] 4.3. tursoのテストをmockTursoApi化
  - 説明: 4テストファイルのmockContext(withTursoEnv)+mockContext.transient(withFetch)を
    mockTursoApi()に置き換える。検証をパス+bodyのみに変更する
  - 完了条件:
    - テスト: turso内の全テストがパスすること

- [ ] 4.4. 旧コンテキストファイルの削除
  - 説明: fetch-context.ts, turso-env-context.tsを削除する
  - 完了条件:
    - 検証: pnpm type-check && pnpm lint && pnpm test が通ること

### 5. パッケージ間関数依存のvi.spyOnパターン復元（FR6）

方針変更: turso関数のdiva化は過剰な抽象化のため、vi.spyOnパターンに戻す。turso-api-context（HTTPクライアントのDI）は引き続き維持する。

依存関係: 5.1 → 5.2 → 5.3 → 5.4 の順。

- [ ] 5.1. turso関数のmockをvi.spyOnパターンに戻す
  - 説明: mockファイル（create-database.mock.ts等）の内部実装をmockContext.transientからvi.spyOnに変更する。mockファイルの配置（featureとコロケーション）は維持する。testing/index.tsからのre-exportも維持する
  - 完了条件:
    - テスト: tursoパッケージの全テストがパスすること
    - 型: mockXxxOk/Errorが引き続きspy（呼び出し検証可能なオブジェクト）を返すこと

- [ ] 5.2. 外部パッケージの呼び出しを直接importに戻す
  - 説明: getCreateDatabase()()→createDatabase()、getDeleteDatabase()()→deleteDatabase()、getIssueToken()()→issueToken()のように、resolver経由の呼び出しを直接importに戻す。対象: authentication（create-auth-database, destroy-auth-database, get-valid-credentials）、per-user-database（create-turso-per-user-database）
  - 完了条件:
    - テスト: authentication, per-user-databaseの全テストがパスすること

- [ ] 5.3. 4つの関数contextファイルとproviderを削除
  - 説明: turso/helpers/のcreate-database-context.ts, delete-database-context.ts, issue-token-context.ts, list-databases-context.tsを削除する。features/の各実装ファイルからprovider export、getXxx resolver exportを削除する
  - 完了条件:
    - 検証: pnpm type-check && pnpm lint && pnpm test が通ること

- [ ] 5.4. testing/index.tsから不要なre-exportを削除
  - 説明: withCreateDatabase, withDeleteDatabase, withIssueToken, withListDatabasesのraw provider re-exportと、withTursoApi, mockTursoApiのre-exportを削除する。mockXxxOk/Errorのre-exportは維持する
  - 完了条件:
    - 検証: pnpm type-check && pnpm lint && pnpm test が通ること

### 6. Server Action層のwithAuthenticated導入（FR7）

依存関係: 6.1, 6.2 は並行可能 → 6.3 → 6.4, 6.5 は並行可能。

- [ ] 6.1. セッションコンテキストの作成
  - 説明: apps/webにセッション取得のdivaコンテキストを作成する。auth.api.getSessionをラップし、未認証時はエラーを返す
  - 完了条件:
    - テスト: 認証済みセッションが取得できること
    - テスト: 未認証時にエラーが返ること

- [ ] 6.2. Per-User DBクライアントコンテキストの作成
  - 説明: apps/webにPer-User DBクライアント取得のdivaコンテキストを作成する。getValidCredentials + createPerUserDatabaseClientをラップする
  - 完了条件:
    - テスト: 有効なクレデンシャルでDBクライアントが取得できること

- [ ] 6.3. withAuthenticatedヘルパーの作成
  - 説明: セッション + Per-User DBクライアントのコンテキストをwithContextsでまとめるヘルパーを作成する
  - 完了条件:
    - テスト: withAuthenticated内でsession, dbが取得できること
    - テスト: 未認証時にエラーハンドリングされること

- [ ] 6.4. 既存Server Actionのリファクタリング
  - 説明: dashboard関連のServer Actions（signOut, deleteAccount）と認証が必要なServer ActionにwithAuthenticatedを適用する
  - 完了条件:
    - テスト: 各Server Actionが正常に動作すること
    - 確認: 手動でサインアウト・アカウント削除が動作すること

- [ ] 6.5. Per-User DBクレデンシャルAPI Routeのリファクタリング
  - 説明: /api/per-user-database/credentials のAPI RouteにwithAuthenticatedを適用する
  - 完了条件:
    - テスト: 認証済みリクエストでクレデンシャルが返ること
    - テスト: 未認証リクエストで401が返ること

## 議論ログ

### ラウンド1: 設計判断

- Q1: 統合テストのDB注入をどうするか？
- A1: diva mockContextに統一。vi.hoisted + vi.mockを廃止し、mockContextでインメモリDBを注入する
- 判断: FR3の方針と一致。全テストで統一パターン

- Q2: tursoパッケージのコンテキスト粒度は？
- A2: 分離（withFetch + withTursoEnv）。fetchは他のHTTPクライアントでも再利用可能、テスト時の柔軟性も高い
- 判断: 2つの独立したコンテキストとして定義
- 更新: ラウンド2で撤回。TursoApiClientに統合（下記参照）

- Q3: envパッケージのdiva化方針は？
- A3: envをdivaコンテキスト化する。resolverをProxyでラップしてenv.XXXのアクセスパターンを維持
- 判断: FR5の記載通り実施。エクスポートパターンも合意

### ラウンド2: Phase 4レビュー後のリファクタリング

- Q5: turso-env-contextは必要か？
- A5: 不要。tursoは基盤パッケージであるpackages/envに直接依存すべき。turso専用のenv contextは過剰な抽象化
- 判断: turso-env-contextを廃止

- Q6: fetchContext + tursoEnvContextの2つのコンテキストをどう統合するか？
- A6: TursoApiClient（fetch + baseURL + auth を内包するファクトリ関数）に統合する。3つのアプローチを比較:
  - A. ファクトリ関数（get/post/deleteメソッドを持つオブジェクトを返す）
  - B. クラス（TursoApiClientクラス）
  - C. 高階関数（configured fetch）
- 判断: A（ファクトリ関数）を採用。理由:
  - 高階関数(C)はmethod/headers指定の重複が残り、凝集度の改善が中途半端
  - クラス(B)は現状のコードベースに合わない（アロー関数規約）し、この規模では過剰
  - ファクトリ関数(A)がシンプルさと凝集度のバランスが最も良い
  - 5つのturso関数すべてで重複していたgetTursoEnv→getFetch→URL構築→Authorizationヘッダー付与が、TursoApiClient内に集約される

- Q4: withAuthenticatedのスコープは？
- A4: セッション + Per-User DBクライアント。ただし各パッケージは個別にprovider/resolverをエクスポートする。アプリケーション側（apps/web）で使い勝手のいいようにwithAuthenticatedとしてまとめる
- 判断: パッケージの責務分離を維持しつつ、アプリケーション層で利便性を提供
