# 要件定義: per-user-database への diva curried provider 導入

## 背景

PR #597 で `packages/turso` に diva（fetch context）を導入、`packages/authentication` には database context として導入済み。コードベース全体を調査した結果、既存の `vi.mock` / `vi.spyOn` パターンの置き換え先としては diva 導入先が出尽くしていた。

しかし、per-user-database の利用パターン（接続情報取得 → クライアント作成 → 使用）を diva curried provider でまとめることで、今後の利用側コードを簡潔にできる可能性が浮上した。per-user-database は今後 apps/web から本格利用される予定で、現在は技術検証用の実装のみ。

## 要望

- W1: per-user-database を使う際の「接続情報取得 → クライアント作成 → クエリ実行」の定型処理を、呼び出し側が毎回書かなくて済むようにしたい
- W2: テストで per-user-database を使う関数をモックする際、統一的なパターン（`mockContext`）で書けるようにしたい

## 要求

- R1（→ W1）: diva の curried provider で接続情報取得 + クライアント作成を1箇所にまとめる
- R2（→ W2）: `mockContext(withPerUserDatabase, () => inMemoryDb)` でテスト時のDB注入を統一する
- R3（→ W1）: apps/web 用の合成ヘルパー（`runWithPerUserDb`）を提供し、userId を渡すだけで per-user DB スコープに入れるようにする

## 前提と検証

| # | 前提 | カテゴリ | リスク | 検証結果 | 影響 |
| --- | --- | --- | --- | --- | --- |
| A1 | diva の builder（`withXxx(() => value)`）は同期的である必要がある | 技術的制約 | 高 | 検証済み: `ProviderFn` の型は `(builder: () => T) => ...` で同期。非同期のクレデンシャル取得はスコープ外で完了させる必要がある | クライアント作成を同期で行う必要がある |
| A2 | `createPerUserDatabaseClientWithoutMigration` は同期関数である | 技術的実現性 | 高 | 検証済み: `createClient()` と `drizzle()` はいずれも同期。戻り値は `LibSQLDatabase<typeof schema>` | builder 内で呼べる |
| A3 | `packages/per-user-database` → `packages/authentication` の依存を作らずに設計できる | 依存関係 | 高 | 検証済み: context 定義を per-user-database に、合成（credentials取得 + client作成）を apps/web に配置することで回避可能 | パッケージ分離の維持 |
| A4 | diva は AsyncLocalStorage ベースのため React Native では動作しない | プラットフォーム制約 | 中 | 検証済み: `@praha/diva/dist/esm/internal/stack-storage.js` が `node:async_hooks` を使用。iOS は `@next-lift/authentication` を依存に持たず影響なし | iOS は既存の React Context パターンを維持 |
| A5 | 既存の `mockedPerUserDatabase`（setup.ts）にスキーマ型を付与してcontext mock用に使える | テスト基盤 | 中 | 検証済み: 既存は `drizzle(client)` でスキーマなし。authentication パッケージの `mocked-authentication-database.ts` と同様に `drizzle(client, { schema })` で別ファイル作成すれば型が合う | `mocked-per-user-database.ts` を新規作成 |
| A6 | `withTursoFetch` が必要なスコープ（turso 関数がfetch contextを必要とする場合）と `withPerUserDatabase` スコープの共存に問題がない | スコープ | 中 | 検証済み: `getValidCredentials` が完了してから `withPerUserDatabase` スコープに入るため順次実行。ネストの競合なし | 設計に影響なし |

## 調査結果

### コードベース調査

- **diva 導入済みパッケージ**: `packages/turso`（fetch context）、`packages/authentication`（database context）
- **参照パターン**: `packages/authentication/src/helpers/database-context.ts` の `[getDatabase, withDatabase] = createContext<LibSQLDatabase<typeof schema>>()` パターン
- **per-user-database の現状**: 技術検証用実装のみ。`createTursoPerUserDatabase` は turso の `createDatabase` + `issueToken` を呼び出す
- **接続情報ライフサイクル**: ユーザー登録時に作成・暗号化保存 → `getValidCredentials` でDB SELECT + 復号 + 期限チェック（+ 自動更新） → API レスポンスまたは SecureStore キャッシュ
- **クライアント作成**: `createPerUserDatabaseClient`（async, migration あり）と `createPerUserDatabaseClientWithoutMigration`（migration なし）の2種

### 実現可能性の評価

| 要望/要求 | 実現可能性 | 根拠 | 備考 |
| --- | --- | --- | --- |
| R1: curried provider | 可能 | authentication パッケージの `withAuthenticationDatabase` と同じパターン | builder の同期制約に注意 |
| R2: mockContext パターン | 可能 | `mockContext(withPerUserDatabase, () => inMemoryDb)` で統一可能 | setup.ts のスキーマ型整合性を要確認 |
| R3: apps/web 合成ヘルパー | 可能 | `getValidCredentials` + `createPerUserDatabaseClientWithoutMigration` + `withPerUserDatabase` の合成 | エラーハンドリングの設計が必要 |

## 要件

### 機能要件

- [ ] FR1: `@praha/diva` を `packages/per-user-database` の依存に追加する
- [ ] FR2: `packages/per-user-database` に diva context を定義する（`getPerUserDatabase` resolver + `withPerUserDatabase` provider）
  - 型: `LibSQLDatabase<typeof schema>`（`createPerUserDatabaseClientWithoutMigration` の戻り値と一致）
  - 配置: `src/helpers/database-context.ts`
- [ ] FR3: `packages/per-user-database` の `package.json` に `"./context"` export エントリを追加する
- [ ] FR4: テスト用の mock ヘルパーを作成する
  - `src/helpers/database-context.mock.ts`: `mockContext` ベースの mock セットアップ
  - `src/testing/mocked-per-user-database.ts`: スキーマ型付きのインメモリ DB（`drizzle(client, { schema })`）
  - `src/testing/index.ts` から re-export
- [ ] FR5: `apps/web` に合成ヘルパーを作成する
  - `src/libs/per-user-database/per-user-database-context.ts`
  - `getValidCredentials` + `createPerUserDatabaseClientWithoutMigration` + `withPerUserDatabase` の合成
  - userId を渡すだけで per-user DB スコープに入れる API を提供する
- [ ] FR6: 既存の全テストがパスすることを確認する（`pnpm type-check && pnpm lint && pnpm test`）

### 非機能要件（該当する場合）

なし

### スコープ外

- iOS アプリの変更: React Native で diva は動作しない。既存の React Context + SecureStore パターンを維持
- 環境変数の diva 化: `mockPrivateEnv` で既に適切にモックされている
- 既存テストパターン（`vi.spyOn` による turso 関数モック）の置き換え: 関数レベルの spy は diva の関心事ではない
- 合成ヘルパーの利用側コード（server action 等）の実装: 今回は provider パターンの確立まで

## 保留事項

| 事項 | 保留理由 | 決定タイミング |
| --- | --- | --- |
| ~~合成ヘルパーのエラーハンドリング方針（throw vs Result）~~ | ~~利用側（server action等）の実装パターンが確定してから決める方が適切~~ | **解決済み**: Result 型（`@praha/byethrow`）で実装する（`02-breakdown.md` 議論ログ参照） |
| `createPerUserDatabaseClient`（migration あり）を使うケースへの対応 | スキーマ進化後の既存ユーザーDB対応は別タスク（ADR-020関連） | per-user DB の本格利用開始時 |

## 議論ログ

### ラウンド1: diva 導入先の調査

#### 質問と回答

- Q: PR #597 の続きとして、次にどこに diva を導入すべきか？
- A: コードベース全体を調査した結果、既存コードの `vi.mock` / `vi.spyOn` パターン置き換えとしては導入先が出尽くしている。per-user-database は PR #597 の要件定義時に「`vi.mock` を使用しておらず恩恵が薄い」と評価・見送り済み。

#### 発見

| 前提/論点 | 発見 | 影響 | 判断 |
| --- | --- | --- | --- |
| per-user-database の vi.mock | 使用なし（PR #597 の評価と一致） | vi.mock 置き換え目的での diva 導入は不要 | 別の角度で検討 |
| env と diva の相性 | env は Proxy + 遅延評価パターン。AsyncLocalStorage とは設計思想が異なる | diva 化のメリットなし | 対象外 |

### ラウンド2: curried provider の着想

#### 質問と回答

- Q: 接続情報をキャッシュから取得する処理を curried provider にまとめればすっきり書けそうでは？
- A: per-user-database は今後本格利用される予定。接続情報取得 → クライアント作成 → 使用の定型処理を provider にまとめる設計案は有効。vi.mock 置き換えではなく、利用パターンの簡素化が目的。

- Q: AsyncLocalStorage が React Native で使えないなら、authentication DB が iOS で使えていないのでは？
- A: iOS は `@next-lift/authentication` を依存に持たない。認証は Better Auth の HTTP API 経由、per-user DB の接続情報は Web API + SecureStore キャッシュで取得。diva のスコープはサーバーサイドに閉じている。

#### 発見

| 前提/論点 | 発見 | 影響 | 判断 |
| --- | --- | --- | --- |
| diva の新しい活用方法 | vi.mock 置き換えだけでなく、利用パターンの合成にも有効 | per-user-database の context 定義が可能 | curried provider として導入 |
| iOS と diva の関係 | iOS は authentication パッケージを使わない | diva の Node.js 依存は問題にならない | iOS は変更不要 |

## 合意事項

- [x] ユーザー承認済み
