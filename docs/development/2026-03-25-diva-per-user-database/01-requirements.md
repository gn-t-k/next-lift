# 要件定義: packages/turso の @praha/diva 導入

## 背景

packages/authentication への diva 導入が完了し、テスタビリティが向上した。次のステップとして packages/turso に diva を導入する。turso パッケージは4つの機能（createDatabase, issueToken, deleteDatabase, listDatabases）すべてで `globalThis.fetch` を手動で差し替えるモックパターンを使用しており、diva の `mockContext` で統一的に置き換えられる。

当初は packages/per-user-database を候補としていたが、調査の結果 `vi.mock` を使用しておらず diva 導入の恩恵が薄いことが判明したため、turso に方向転換した。

## 要望

- W1: テストを書く際に「この依存はどのパターンでモックするか」を都度判断する認知負荷を減らしたい
- W2: `globalThis.fetch` の手動差し替え（save/restore）パターンを、よりシンプルな仕組みに置き換えたい

## 要求

- R1（→ W1, W2）: `fetch` の呼び出しを diva の `createContext` + resolver に置き換える
- R2（→ W2）: テストの `globalThis.fetch = mockFetch` / restore パターンを `mockContext` に置き換える
- R3（→ W1, W2）: 既存の全テストがパスすることを確認する

## 前提と検証

| # | 前提 | カテゴリ | リスク | 検証結果 | 影響 |
| --- | --- | --- | --- | --- | --- |
| A1 | diva の `createContext<T>` に `typeof fetch` を渡せる | 技術的実現性 | 高 | 検証済み: `createContext` は任意の型パラメータを受け付ける。関数型も問題なし | fetch resolver の型定義が可能 |
| A2 | `getDatabase`（内部関数）は `createDatabase` から呼ばれる。同じ provider スコープ内で fetch resolver を共有できる | スコープ | 中 | 検証済み: provider スコープ内で resolver は同じキャッシュ値を返す。getDatabase も getFetch() で同じ fetch インスタンスを取得する | 409 Conflict 時の getDatabase 呼び出しが正常に動作する |
| A3 | CLI ファイル（`features/cli/`）は実装関数を呼ぶだけで、fetch を直接使わない | 影響範囲 | 低 | 検証済み: 全4ファイルが実装関数（createDatabase 等）を import して呼ぶだけ。fetch の直接使用なし | CLI 側の変更は不要 |
| A4 | turso パッケージの公開 API（mock ファイルの `mockXxxOk` / `mockXxxError`）は関数全体を spy するため、fetch の diva 化とは独立 | 移行 | 中 | 検証済み: mock ファイルは `vi.spyOn(module, "関数名").mockResolvedValue(...)` で関数を丸ごと差し替え。内部の fetch 注入方法には無関係 | 外部パッケージのテストに影響しない |
| A5 | 環境変数（`env.TURSO_PLATFORM_API_TOKEN`, `env.TURSO_ORGANIZATION`）は `mockPrivateEnv` で既にモック済みのため、diva 化は不要 | スコープ | 低 | 検証済み: テストファイルで `mockPrivateEnv` を使用 | env は現行パターンを維持 |

## 調査結果

### コードベース調査

- **fetch 使用箇所（5箇所）**: `create-database.ts`、`get-database.ts`（内部関数）、`issue-token.ts`、`delete-database.ts`、`list-databases.ts`。すべてグローバルの `fetch` を直接呼び出し
- **テストの共通パターン**: 4テストファイルすべてで同じ `const mockFetch = vi.fn()` + `globalThis.fetch = mockFetch` / `globalThis.fetch = originalFetch` パターン（beforeEach/afterEach で save/restore）
- **create-database.test.ts の特殊性**: 409 Conflict テストで `vi.spyOn(getDatabaseModule, "getDatabase")` を使い、内部関数を直接モック。この spyOn は維持する（fetch の diva 化とは独立した関心事）
- **CLI ファイル（4つ）**: 実装関数を import して呼ぶだけ。fetch を直接使わない。変更不要
- **mock ファイル（4つ）**: `vi.spyOn(module, "関数名")` で関数全体を差し替え。fetch の注入方法とは無関係。変更不要
- **外部からの使用**: per-user-database は `createDatabase`, `issueToken` を、authentication は `issueToken` を使用。いずれも mock ファイル経由でモック。影響なし

### 実現可能性の評価

| 要望/要求 | 実現可能性 | 根拠 | 備考 |
| --- | --- | --- | --- |
| R1: fetch → diva resolver | 可能 | `createContext<typeof fetch>()` で型安全に定義可能。authentication の `getDatabase` resolver と同じパターン | |
| R2: globalThis.fetch → mockContext | 可能 | `mockContext(withFetch, () => mockFetch)` でテストファイル上部に1行書くだけ。beforeEach/afterEach の save/restore が不要に | |
| R3: 全テストパス | 可能 | mock ファイルは関数全体を spy するため、内部の fetch 注入方法には影響しない | |

## 要件

### 機能要件

- [ ] FR1: `@praha/diva` を `packages/turso` の依存に追加する
- [ ] FR2: diva context を定義する（`getFetch` resolver + `withFetch` provider + `withTursoFetch` composed provider）
- [ ] FR3: 実装ファイル5つ（create-database, get-database, issue-token, delete-database, list-databases）で `fetch` 直接呼び出しを `getFetch()` resolver に置き換える
- [ ] FR4: 各実装ファイルの公開関数を `withTursoFetch` provider でラップする（authentication の `withAuthenticationDatabase` パターンと同様）
- [ ] FR5: `get-database.ts`（内部関数）は provider ラップせず、`getFetch()` resolver のみ使用する（`createDatabase` の provider スコープ内で呼ばれるため）
- [ ] FR6: 4つのテストファイルで `globalThis.fetch = mockFetch` / restore パターンを `mockContext(withFetch, () => mockFetch)` に置き換える
- [ ] FR7: `create-database.test.ts` の 409 テストを fetch モックの連鎖（`mockResolvedValueOnce`）に統一する。`vi.spyOn(getDatabaseModule, "getDatabase")` を廃止し、実際のコードパス（createDatabase → getDatabase → fetch）を通す統合テストにする
- [ ] FR8: 既存の全テストがパスすることを確認する

### 非機能要件（該当する場合）

なし

### スコープ外

- CLI ファイルの変更: 実装関数を呼ぶだけで fetch を直接使わないため不要
- mock ファイル（`mockXxxOk` / `mockXxxError`）の変更: 関数全体を spy するため fetch の注入方法とは無関係
- 環境変数の diva 化: `mockPrivateEnv` で既に適切にモックされている
- 外部パッケージ（per-user-database, authentication, apps/web）のテスト変更

## 保留事項

| 事項 | 保留理由 | 決定タイミング |
| --- | --- | --- |
| fetch context の配置場所のファイル名 | breakdown フェーズで決定 | 設計・タスク分解時 |

## 議論ログ

### ラウンド1: 対象パッケージの変更

- Q: packages/per-user-database に diva を導入すべきか？
- A: 調査の結果、per-user-database の `testing/setup.ts` は `vi.hoisted()` を使っているが `vi.mock()` は使っていない。DB 接続も動的（ユーザーごと）で固定の `getDatabase()` がないため、diva の恩恵が薄い。packages/turso に方向転換。

#### 発見

| 前提/論点 | 発見 | 影響 | 判断 |
| --- | --- | --- | --- |
| per-user-database に vi.mock がある | setup.ts に vi.mock() は存在しない。vi.hoisted() はタイミング制御のみ | diva 導入の前提が成り立たない | turso に方向転換 |
| turso の fetch モックパターン | 4テストすべてで同じ globalThis.fetch 差し替えパターン | diva で統一的に改善可能 | turso を次の導入先に選定 |

### ラウンド2: 設計判断

#### 質問と回答

- Q: diva context の粒度をどうするか？（fetch のみ / Turso API クライアント / fetch + env）
- A: fetch のみ注入。変更が最小限で authentication パターンとの一貫性が高い。

- Q: create-database.test.ts の 409 テストで getDatabase の spyOn をどうするか？
- A: 当初は spyOn 維持を予定していたが、diva 導入後は createDatabase と getDatabase が同じ fetch resolver を共有するため、fetch モックの連鎖（`mockResolvedValueOnce`）で統一できる。spyOn を廃止し、実際のコードパスを通す統合テストにする方が一貫性が高く、テスト品質も向上する。

#### 発見

| 前提/論点 | 発見 | 影響 | 判断 |
| --- | --- | --- | --- |
| context の粒度 | fetch のみで十分。URL 構築・ヘッダー設定は各関数固有のロジック | 抽象化レイヤーの追加は不要 | fetch のみ注入 |
| 409 テストの spyOn | diva 導入後は createDatabase と getDatabase が同じ getFetch() を使うため、fetch モックの連鎖で 409 → getDatabase の応答を制御可能 | spyOn 不要、`import * as getDatabaseModule` も削除可能 | fetch モック連鎖で統一 |

## 合意事項

- [x] ユーザー承認済み
