# 要件定義: packages/authentication の @praha/diva 導入

## 背景

コードベースのテスタビリティ向上のため @praha/diva を導入する。前回の取り組み（PR #578）では手広く進めすぎて実装が把握できなくなったため、今回はゼロから考え直し、狭い範囲から段階的に進める。packages/authentication の認証DB接続（`getDatabase()`）を最初のdiva化対象として選定した。

## 要望

- W1: テストを書く際に「この依存はどのパターンでモックするか」を都度判断する認知負荷を減らしたい
- W2: `vi.hoisted + vi.mock` という複雑なモックパターンを、よりシンプルな仕組みに置き換えたい

## 要求

- R1（→ W1, W2）: `getDatabase()` を diva の `createContext` + resolver に置き換える
- R2（→ W2）: `testing/setup.ts` の `vi.hoisted + vi.mock` を `mockContext` に置き換える
- R3（→ W1, W2）: 既存の全テストがパスすることを確認する

## 前提と検証

| # | 前提 | カテゴリ | リスク | 検証結果 | 影響 |
| --- | --- | --- | --- | --- | --- |
| A1 | `mockContext` は provider スコープ外でのみ有効（provider 内では provider の値が優先される） | 技術的実現性 | 高 | 検証済み: resolver は `storage.getItem()` → `provider[Mock]` → throw/undefined の優先順位 | ビジネスロジック関数は provider でラップせず resolver を直接呼ぶ設計にする必要がある |
| A2 | `@praha/diva` は package.json に未登録（node_modules には v1.0.2 が存在） | 依存関係 | 低 | 検証済み: どの package.json にも記載なし | `pnpm add` で追加が必要 |
| A3 | 本番環境で resolver が値を返すには、呼び出し元で provider を提供する必要がある | スコープ | 高 | 検証済み: パッケージ内 Composition Root パターンを採用。index.ts で provider ラップ | apps/web の変更は不要 |
| A4 | `mockedAuthenticationDatabase` はテスト内で直接参照される（factories、DB 状態検証） | スコープ | 中 | 検証済み: テストファイルで `factories(mockedAuthenticationDatabase)` や直接クエリに使用 | setup.ts で DB インスタンスを作成し、mockContext への注入と export を両立させる |
| A5 | apps/web のテスト（setup-per-user-database.test.ts、get-credentials.test.ts）は authentication の関数を vi.spyOn でモックしている | 移行 | 中 | 検証済み: 関数レベルのモック（`mockGetValidCredentialsOk` 等）であり、getDatabase のモックとは独立 | apps/web のテストは変更不要。spyOn が resolver 呼び出し前に介入するため |
| A6 | provider を export すると authentication パッケージの内部実装（認証DBの存在）が外部に漏れる | アーキテクチャ適合 | 高 | 検証済み: パッケージの export 境界（index.ts）を composition root にすれば provider の export は不要 | index.ts で provider ラップし、外部 API は変わらない |

## 調査結果

### コードベース調査

- **getDatabase() の使用箇所（5箇所）**: `create-auth.ts`（除外）、`delete-user-database-credentials.ts`、`get-user-database-credentials.ts`、`save-user-database-credentials.ts`、`refresh-user-database-token.ts`
- **testing/setup.ts のモックパターン**: `vi.hoisted()` でインメモリ DB を作成 → `vi.mock("../helpers/get-database")` で差し替え → `beforeEach` でテーブルリセット+マイグレーション
- **apps/web のエントリポイント（2箇所）**: `libs/auth.ts`（`saveUserDatabaseCredentials`）、`route.ts`（`getValidCredentials`）。いずれも index.ts 経由で import しているため、index.ts で provider ラップすれば apps/web 側の変更は不要
- **get-valid-credentials.ts**: `getDatabase()` を直接呼ばず、同ディレクトリの `getUserDatabaseCredentials` と `refreshUserDatabaseToken` を直接 import している。直接 import なので resolver 版が使われ、自然にパターンに乗る
- **テストファイル**: すべて実装ファイルを直接 import しており、index.ts 経由ではない。そのため provider スコープ外で実行される
- **ADR-013 Amendment**: diva 導入は承認済み（2026-03-11）

### 外部調査

- **diva resolver の動作優先順位**（ソースコード確認）:
  1. `storage.getItem()` でアクティブな provider スコープをチェック → あれば builder を実行
  2. provider なし → `provider[Mock]` をチェック → あれば Mock 値を返す
  3. いずれもなし → `required: true` なら throw、`false` なら undefined
- **mockContext の仕組み**: provider オブジェクトの `[Mock]` シンボルに値/ファクトリを設定するだけ。provider スコープとは独立

### 実現可能性の評価

| 要望/要求 | 実現可能性 | 根拠 | 備考 |
| --- | --- | --- | --- |
| R1: getDatabase → diva resolver | 可能 | パッケージ内 Composition Root パターン（index.ts で provider、実装ファイルで resolver）で A1・A3・A6 を解消 | create-auth.ts は除外 |
| R2: vi.hoisted + vi.mock → mockContext | 可能 | mockContext は provider スコープ外で動作。テスト側は provider を使わないため問題なし | |
| R3: 全テストパス | 可能 | テストは実装ファイルを直接 import しているため、テストコード自体の変更は不要 | |

## 要件

### 機能要件

- [ ] FR1: `@praha/diva` を `packages/authentication` の依存に追加する
- [ ] FR2: diva context を定義する（`getDatabase` resolver + `withDatabase` provider）
- [ ] FR3: 現 `getDatabase()` を `createDatabaseClient()` にリネームする（パッケージ内で database = auth DB なので、resolver が `getDatabase` を名乗るべき）
- [ ] FR4: 実装ファイル4つで DB 操作のみを内部関数に切り出す（`getDatabase` resolver を使用）。暗号化等のロジックは既存の export 関数に残す。既存の export 関数は `withDatabase` provider でラップし、切り出した関数を呼ぶ
- [ ] FR5: `create-auth.ts` は `createDatabaseClient()` を直接呼ぶ（diva 化しない）
- [ ] FR6: `testing/setup.ts` の `vi.hoisted + vi.mock` を `mockContext` に置き換える（`mockedAuthenticationDatabase` の export は維持）
- [ ] FR7: テストファイルを切り出した内部関数用に置き換える（旧テストファイルは削除）。暗号化テストは encrypt 関数自体のテストに移す
- [ ] FR8: 内部関数をデータ投入に使うテスト（`get-valid-credentials.test.ts` 等）は、内部関数を直接呼ぶよう変更する。暗号化が必要な場合は `encrypt` を直接呼ぶ
- [ ] FR9: 既存の全テストがパスすることを確認する

### 非機能要件（該当する場合）

なし

### スコープ外

- `create-auth.ts` の diva 化: アプリ初期化時に呼ばれ、provider スコープに乗らないため
- apps/web の変更: 各実装ファイル内で provider ラップするため不要
- env / turso パッケージの diva 化
- mock ファイルの外部インターフェース変更: `mockXxxOk` / `mockXxxError` の名前・spy 対象はそのまま維持（spy は関数を丸ごと差し替えるため provider ラップは無関係）

## 保留事項

| 事項 | 保留理由 | 決定タイミング |
| --- | --- | --- |
| `getDatabase()` の完全廃止 | `create-auth.ts` が引き続き使用するため、現時点では削除できない | `create-auth.ts` の diva 化時（将来のスコープ） |

## 議論ログ

### ラウンド1: 移行戦略

#### 質問と回答

- Q: Server Action 層の変更なしで mockContext を機能させる移行戦略は？
- A: Server Action 内で provider 層を設け、内部でテスト可能な関数を呼ぶ Composition Root パターンを採用。

#### 発見

| 前提/論点 | 発見 | 影響 | 判断 |
| --- | --- | --- | --- |
| mockContext は provider スコープ外でのみ有効 | diva ソースコード確認で確定。resolver は storage → Mock → throw の優先順位 | 関数が自身を provider でラップすると mockContext が無効化 | Composition Root パターン採用 |
| create-auth.ts の扱い | アプリ初期化時に呼ばれ、Composition Root の外。テストでも別のモックパターンを使用 | diva 化の恩恵が薄い | getDatabase() をそのまま維持 |

### ラウンド2: Provider の配置

#### 質問と回答

- Q: provider を apps/web に export すべきか？
- A: provider の export は authentication パッケージの内部実装の漏洩。パッケージの export 境界（index.ts）を composition root にすれば、provider の export は不要で apps/web の変更も不要。

#### 発見

| 前提/論点 | 発見 | 影響 | 判断 |
| --- | --- | --- | --- |
| provider export の是非 | export すると「認証DBの存在」という内部実装を外部に漏らす | パッケージの抽象化が壊れる | index.ts を composition root にし、provider は内部に閉じる |
| Composition Root の位置 | バレルファイル（index.ts）に実装を入れるのではなく、各実装ファイル内で provider ラップする | index.ts は変更不要。各ファイルが自身の provider を管理 | 各実装ファイル内で層分離（provider 付き export + resolver 使用の内部関数） |

### ラウンド3: 内部関数の切り出し範囲とテスト

#### 質問と回答

- Q: 切り出す範囲は encrypt + DB write をまとめるか、DB write だけか？
- A: DB write だけを切り出す。encrypt + DB write をまとめると、外側が provider ラップだけの無駄な間接層になる。暗号化テストは encrypt 関数自体のテストに分離する。
- Q: mock は `saveUserDatabaseCredentials` と内部関数のどちらを対象にすべきか？
- A: 内部関数。理由: `get-valid-credentials.test.ts` 等で `saveUserDatabaseCredentials`（provider 付き）を呼ぶと本番 DB に接続しようとするため。内部関数を mock 対象にすれば、パッケージ内テストで直接呼べる。

#### 発見

| 前提/論点 | 発見 | 影響 | 判断 |
| --- | --- | --- | --- |
| 切り出し範囲 | encrypt + DB write をまとめると外側は provider ラップだけの無意味な層になる | 切り出し範囲は DB 操作のみに限定 | 暗号化等のロジックは既存 export 関数に残す |
| 暗号化テスト | 現在のテストは encrypt + DB write を一体でテストしている | DB 操作テストと暗号化テストを分離する必要あり | 暗号化テストは encrypt 関数自体のテストに移す |
| mock 対象 | 外部向け mock（`mockXxxOk` / `mockXxxError`）は `saveUserDatabaseCredentials` を spy する現行のままで問題なし。spy は関数を丸ごと差し替えるため provider ラップは無関係 | mock ファイル変更なし | パッケージ内テスト（`get-valid-credentials.test.ts` 等）でデータ投入が必要な場合は、mock ではなく内部関数を直接呼ぶ（+ encrypt）|

## 合意事項

- [x] ユーザー承認済み
