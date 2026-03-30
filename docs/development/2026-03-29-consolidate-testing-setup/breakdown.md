# Breakdown: per-user-database テストセットアップ統合

## ステータス

- 状態: 確定
- 現在のフェーズ: 5/5
- 最終更新: 2026-03-29

## 要件サマリー

- 要件ドキュメント: [GitHub Issue #601](https://github.com/gntk/next-lift/issues/601)
- スコープ: `packages/per-user-database/src/testing/` 内の `setup.ts` と `mocked-per-user-database.ts` のインメモリDB重複を解消する

### 現状の問題

`setup.ts` と `mocked-per-user-database.ts` がそれぞれ独立したインメモリSQLiteデータベースを作成し、それぞれ `beforeEach` でクリーンアップしている。

- `setup.ts`: `vi.hoisted()` でスキーマ型**なし**のDBを作成 → **どこからもインポートされていない（未使用）**
- `mocked-per-user-database.ts`: スキーマ型**付き**のDBを作成 → `database-context.mock.ts` と `testing/index.ts` から使用されている

結果: テストごとに2つの `beforeEach` が走り、片方は誰も使わないDBをリセットしている。

## 設計概要

### 影響範囲

- packages/per-user-database:
  - `src/testing/setup.ts` — 書き換え
  - `src/testing/mocked-per-user-database.ts` — 書き換え

### アプローチ

- `setup.ts` を削除する
  - `vi.hoisted()` による独自DB作成、`beforeEach`、`mockPrivateEnv` をすべて除去
  - `vitest.config.ts` から `setupFiles` を除去
- `mockPrivateEnv` は `database-context.mock.ts` に移動する
  - 理由: `APP_ENV` はDB利用の前提条件なので、DBコンテキストのモックと同じ場所に置く
- `mocked-per-user-database.ts` は現状維持（DBインスタンス作成 + `beforeEach`）
- 役割:
  - `mocked-per-user-database.ts` = DBインスタンスの作成・エクスポート + lifecycle管理（beforeEach）
  - `database-context.mock.ts` = diva コンテキストモック + 環境モック（mockPrivateEnv）

#### 設計判断

- **beforeEach の配置**: `mocked-per-user-database.ts` に残す。凝集度を優先。インポート忘れ時はテーブル不在で即エラーとなり検知可能
- **setup.ts 削除**: `mockPrivateEnv` を `database-context.mock.ts` に移すことで、setupFile が不要になる
- **副作用インポートの排除**: 別 Issue で対応する（今回のスコープ外）

### `vi.hoisted()` が不要な理由

`vi.hoisted()` のコメントには「vitestによるモックより前にメモリDBを初期化したい」とあるが、`mocked-per-user-database.ts` は `vi.hoisted()` なしで正常に動作している。`setup.ts` はvitest setupFileとしてテストファイルより先に実行されるため、通常のインポートで十分。

### 関連ADR

- なし

## タスクツリー

凡例:
- `[?]` 未展開（さらに分解が必要）
- `[ ]` 葉タスク（TDDで着手可能）
- `[x]` 完了

依存関係: 上から順に実装する。

### 1. `setup.ts` の削除と `mockPrivateEnv` の移動

- [ ] 1.1. `mockPrivateEnv` を `database-context.mock.ts` に移動
  - 説明: `setup.ts` の `mockPrivateEnv({ APP_ENV: "development-test" })` を `database-context.mock.ts` に移す。envモックはDB利用の前提条件なので、DBコンテキストモックと同居させる
  - 完了条件:
    - 型: `database-context.mock.ts` が `mockPrivateEnv` を呼び出していること
- [ ] 1.2. `setup.ts` を削除
  - 説明: `setup.ts` を削除し、`vitest.config.ts` から `setupFiles` 設定を除去する
  - 完了条件:
    - テスト: 全テストがパスすること（`pnpm test --filter=@next-lift/per-user-database`）
    - 型: `pnpm type-check` がパスすること

### 2. CLAUDE.md の更新

- [ ] 2.1. `packages/per-user-database/CLAUDE.md` の「テスト環境」セクションを更新
  - 説明: 「`vi.hoisted()` でモック前にDB初期化」の記述を削除し、現在の構成に合わせる
  - 完了条件:
    - 確認: ドキュメントが実装と一致していること

## 議論ログ

### ラウンド1: 出力先ディレクトリ

- Q: breakdownファイルの出力先は？
- A: `docs/development/2026-03-29-consolidate-testing-setup/`
- 判断: デフォルトの日付+機能名ディレクトリを使用

### ラウンド2: beforeEach の配置

- Q: beforeEach をどこに配置するか？
- 選択肢A: `setup.ts`（全テスト自動適用、責務分離）
- 選択肢B: `mocked-per-user-database.ts`（凝集度重視）
- A: 選択肢B
- 理由: DBインスタンスとlifecycleの凝集度を優先。インポート忘れのリスクはテスト即座エラーで検知可能

### ラウンド3: setup.ts の削除

- Q: setup.ts を削除できるか？
- A: 削除する。`mockPrivateEnv` は `database-context.mock.ts` に移す
- 理由: `APP_ENV` はDB利用の前提条件なので、DBコンテキストのモックと同じ場所に置くのが自然
- 副作用インポートの排除は別 Issue で対応する
