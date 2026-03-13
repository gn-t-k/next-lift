# 要件定義: @praha/diva 導入による依存解決・テストモックパターンの統一

## 背景

GitHub Issue #563。現在、依存解決とテスト時のモック差し替えに5種類のパターンが混在しており、テストを書く際に「この依存はどのパターンでモックするか」を都度判断する認知負荷がある。`@praha/diva` を導入して統一することで認知負荷を下げたい。

## 要望

- W1: テストを書く際の認知負荷を下げたい（モックパターンの判断コストをなくす）
- W2: 依存解決パターンを統一して、コードの一貫性を高めたい

## 要求

- R1: `@praha/diva` を導入し、パターン1〜4を `createContext` / `mockContext` に統一する（→ W1, W2）
- R2: 優先度A（認証DB接続）から段階的にリファクタリングする（→ W1）
- R3: Server Action層に `withAuthenticated` ヘルパーを導入する（→ W2）

## 前提と検証

| # | 前提 | カテゴリ | リスク | 検証結果 | 影響 |
| --- | --- | --- | --- | --- | --- |
| A1 | `@praha/diva` が現在のNext.js + Server Actions環境で動作する | 技術的実現性 | 高 | 検証済み: 動作可能。AsyncLocalStorageベースで、各Server Actionで`withContexts`を呼べばスコープが作れる | — |
| A2 | ADR-013（統合テスト優先・DI は避けられる場合は避ける）との整合性がとれる | アーキテクチャ適合 | 高 | 検証済み: ADR-013のステータスを変更し、新ADRを作成する方針でユーザーと合意 | — |
| A3 | diva導入による実装の複雑さ増加が、認知負荷削減のメリットを上回らない | スコープ | 中 | 検証済み: 既存のmockXxxOk/Errorラッパーパターンを維持しつつ内部をmockContextに変更するため、テストの書き方はほぼ変わらない。実装側のwithContexts呼び出しは増えるが、パターンが1つに統一される利点が上回る | — |
| A4 | AsyncLocalStorageベースのdivaがServer Actions（各リクエスト独立）で正しくスコープを管理できる | 技術的実現性 | 高 | 検証済み: divaはAsyncLocalStorage.run()でスコープを作る。各Server Actionで独立してwithContextsを呼べば問題ない | — |
| A5 | 既存のテストセットアップ（vi.hoisted, vi.mock, インメモリDB）からの移行が段階的に可能 | 移行 | 中 | 検証済み: mockContextはグローバル設定のため、vi.spyOnベースのテストと共存可能。パッケージ単位で段階的に移行できる | — |
| A6 | パターン5（関数パラメータ注入）はそのまま残して問題ない | スコープ | 低 | 検証済み: 関数パラメータ（config, now: Date等）は明示的な依存注入であり、divaで解決すべき問題ではない | — |

## 調査結果

### コードベース調査

- **現在の依存解決パターン**: Issue記載の5パターンが実装上も確認済み
  - パターン1: `env.XXX` グローバルProxy参照（turso, authentication, per-user-database）
  - パターン2: `getDatabase()` ヘルパー関数（authentication内のCRUD全般）
  - パターン3: `globalThis.fetch`（tursoパッケージのPlatform API通信）
  - パターン4: 他パッケージの関数をdirect import（createDatabase, issueToken等）
  - パターン5: 関数パラメータ（createPerUserDatabaseClient(config), now: Date）
- **ADR-013**: 統合テスト優先・DIは避けられる場合は避ける方針。ステータス変更＋新ADR作成で対応予定

### 外部調査

- **@praha/diva v1.0.2**: AsyncLocalStorageベースの軽量DI
  - `createContext()` → `[resolver, provider]` を返す
  - `withContexts([provider1, provider2], fn)` で複数コンテキストをネスト
  - `mockContext(provider, () => mockValue)` でテスト用モック（グローバルに設定、AsyncLocalStorage不使用）
  - デフォルトはシングルトン（スコープ内キャッシュ）、`.transient` で毎回生成も可能
  - mockContextはproviderオブジェクトにMockシンボルを設定する実装。スコープ外でもresolverが呼べる

### 実現可能性の評価

| 要望/要求 | 実現可能性 | 根拠 | 備考 |
| --- | --- | --- | --- |
| R1: diva導入でパターン統一 | 可能 | AsyncLocalStorageベースでNode.js環境で動作確認済み | Server Actions（Node.js Runtime）で利用可能 |
| R2: 段階的リファクタリング | 可能 | mockContextはグローバル設定のため、既存テストと共存可能 | パッケージ単位で段階的に移行できる |
| R3: withAuthenticated導入 | 可能 | withContextsでServer Action単位のスコープが作れる | 各Server Actionでの呼び出しが必須（Middleware一括は不可） |

## 要件

### 機能要件

- [ ] FR1: `@praha/diva` をインストールし、必要なパッケージに依存を追加する
- [ ] FR2: ADR-013に追記（Amendment）し、「DIを避ける」方針を撤回する。diva導入により依存解決パターンを統一する旨を記録する
- [ ] FR3: 【A】認証DB接続（`getDatabase()`）をdiva化する
  - `packages/authentication` に `withDatabase` コンテキストを作成
  - 既存の `getDatabase()` を diva の resolver に置き換え
  - 統合テストのセットアップ（`testing/setup.ts`）をdiva化（vi.hoisted + vi.mock → mockContext）
  - 既存のテスト（save/get/refresh/delete UserDatabaseCredentials + createAuth）が全てパスすること
- [ ] FR4: 【B】Turso Platform API通信（fetch + env）をdiva化する
  - `packages/turso` に `withFetch`, `withTursoEnv` コンテキストを作成
  - `globalThis.fetch` の直接書き換えをdiva化
  - 環境変数参照（`env.TURSO_PLATFORM_API_TOKEN` 等）をdiva化
  - 既存テスト（issue-token, create-database等）のモックパターンをmockContextに移行
- [ ] FR5: 【C】環境変数（`env`）をdiva化する
  - `packages/env` に `withPrivateEnv`, `withPublicEnv` コンテキストを作成
  - 全パッケージの `env` グローバル参照をdiva resolver経由に変更
- [ ] FR6: 【D】パッケージ間の関数依存（createDatabase, issueToken等）はvi.spyOnパターンを維持する。diva化した部分は元に戻す
  - turso関数（createDatabase, deleteDatabase, issueToken, listDatabases）のdivaコンテキストを削除
  - `per-user-database → turso`, `authentication → turso` の依存を直接importに戻す
  - テストのモックをmockContext.transientからvi.spyOnパターンに復元する
- [ ] FR7: 【E】Server Action層に `withAuthenticated` ヘルパーを導入する
  - `withContexts` で認証セッション + Per-User DBクライアントをスコープ化
  - 各Server Actionで `withAuthenticated` を呼ぶ構造にリファクタリング
  - Server Actionのテストを追加する

### 非機能要件

- [ ] NFR1: 既存のモックパターン（mockXxxOk / mockXxxError）のインターフェースを維持する（内部実装のみmockContextに変更）
- [ ] NFR2: 各段階で `pnpm test && pnpm type-check && pnpm lint && pnpm build` が通ること
- [ ] NFR3: パターン5（関数パラメータ注入）はそのまま残す

### スコープ外

- パターン5（関数パラメータ注入: config, now: Date等）のdiva化 — 明示的な依存注入であり、divaで解決すべき問題ではない
- Edge Runtime対応 — Server ActionsはNode.js Runtimeで動作するため不要
- diva以外のDIライブラリの検討 — Issue #563で `@praha/diva` に決定済み

## 保留事項

| 事項 | 保留理由 | 決定タイミング |
| --- | --- | --- |
| コンテキストの粒度（withFetch と withTursoEnv を分けるか統合するか） | 実装時にコードを見ながら判断する方が適切 | FR4の設計・タスク分解時 |
| withAuthenticated の詳細設計（どの依存をスコープに含めるか） | Server Action層の全体像を見ながら決定 | FR7の設計・タスク分解時 |

## 議論ログ

### ラウンド1: 初期ヒアリング・ADR整合性

#### 質問と回答

- Q1: ADR-013との関係をどう整理するか？
- A1: ADR-013に追記（Amendment）して「DIを避ける」方針を撤回する。認証テスト戦略全体の見直しは別スコープ

- Q2: スコープはどこまでか？
- A2: A〜E全部（フル導入）

#### 発見

| 前提/論点 | 発見 | 影響 | 判断 |
| --- | --- | --- | --- |
| diva内部実装 | AsyncLocalStorageベース。mockContextはMockシンボルでグローバル設定 | テストではwithContexts不要でmockContextだけで動く | テスト移行が容易 |
| Server Actions互換 | 各Server Actionで独立してwithContextsを呼ぶ設計が必要 | Middleware一括設定は不可 | Issue記載の構造的制約と一致 |

#### 新たに浮上した論点

- 統合テスト（インメモリDB使用）でのdiva活用方法の詳細設計
- mockContextのグローバル設定がテスト間で副作用を起こさないかの確認

### ラウンド2: テスト設計・統合テスト方針

#### 質問と回答

- Q1: テストでのmockContextの呼び方は？
- A1: mockContextを直接呼ぶのではなく、mockファイル側にラッパー関数を持つ。既存のmockXxxOk/mockXxxErrorパターンと同様の構造を維持する

- Q2: 統合テストでのdiva活用方針は？
- A2: 統合テストもdiva化する。インメモリDBの注入もdiva経由にする

#### 発見

| 前提/論点 | 発見 | 影響 | 判断 |
| --- | --- | --- | --- |
| モックパターンの継続性 | 既存のmockXxxOk/mockXxxErrorパターンを維持しつつ、内部実装をmockContextに変更 | テストの書き方は大きく変わらない | 移行コスト低減 |
| 統合テストのdiva化 | vi.hoisted + vi.mock を diva の withContext/mockContext に置き換え | テストセットアップが簡素化される可能性 | 全テストで統一パターン |

### ラウンド3: ADR-013の扱いの明確化

#### 質問と回答

- Q: 「新ADR作成」の意図は？
- A: divaに関するADRではなく、認証モジュールのテスト戦略を再検討したいという意味。ただしそれは別スコープ。今回はADR-013に追記（Amendment）して「DIを避ける」方針を撤回するだけにする

## 合意事項

- [x] ユーザー承認済み（2026-03-11）
