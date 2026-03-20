# Breakdown: packages/authentication の @praha/diva 導入

## ステータス

- 状態: 確定
- 現在のフェーズ: 5/5
- 最終更新: 2026-03-20

## 要件サマリー

- 要件ドキュメント: `docs/development/2026-03-19-diva-introduction/01-requirements.md`
- スコープ: `packages/authentication` の `getDatabase()` を diva の `createContext` + resolver に置き換え、テストの `vi.hoisted + vi.mock` を `mockContext` に置き換える

## 設計概要

### 影響範囲

- packages/authentication: 主な変更対象
- apps/web: 変更不要（index.ts の export インターフェースを維持するため）

### アプローチ

- `helpers/database-context.ts` に diva context（`getDatabase` resolver + `withDatabase` provider）を定義
- 既存の `helpers/get-database.ts` は `createDatabaseClient()` にリネームして残す（`create-auth.ts` が使用）
- 4つの実装ファイルで DB 操作のみを内部関数に切り出し、export 関数は `withDatabase` provider でラップ
- テストは内部関数（DB 操作のみ）のテストに書き換え + `crypto.test.ts` を新設
- `testing/setup.ts` の `vi.hoisted + vi.mock` を `mockContext` に置き換え

### 関連ADR

- `docs/architecture-decision-record/013-authentication-testing-strategy.md`（Amendment 2026-03-11 で diva 導入承認済み）

## タスクツリー

凡例:
- `[?]` 未展開（さらに分解が必要）
- `[ ]` 葉タスク（TDDで着手可能）
- `[x]` 完了

依存関係: 上から順に実装する。同じ階層内で依存がない場合は並行実装可能。

### 1. diva 基盤セットアップ

- [ ] 1.1. 依存追加と `createDatabaseClient` リネーム
  - 説明: `@praha/diva` を `packages/authentication` に追加する。`helpers/get-database.ts` の `getDatabase` を `createDatabaseClient` にリネームし、`create-auth.ts` の import を更新する
  - 完了条件:
    - 型: `pnpm type-check` がパスすること
    - テスト: 既存テスト全パス（`vi.mock` のモジュールパスは変わらないため影響なし）

- [ ] 1.2. diva context 定義
  - 説明: `helpers/database-context.ts` に `createContext` で `getDatabase` resolver と `withDatabase` provider を定義する。`createDatabaseClient()` を provider のファクトリとして使用する
  - 完了条件:
    - 型: `getDatabase` が `LibSQLDatabase` を返す resolver として型が通ること
    - 型: `withDatabase` が provider 関数として型が通ること

- [ ] 1.3. テスト基盤の mockContext 移行
  - 説明: `testing/setup.ts` の `vi.hoisted + vi.mock("../helpers/get-database")` を、`mockContext` による `getDatabase` resolver のモックに置き換える。`mockedAuthenticationDatabase` の export は維持する
  - 完了条件:
    - テスト: 既存テスト全パス（モック方法が変わるだけで振る舞いは同じ）

### 2. 実装ファイルの移行（4ファイル）

依存関係: 2.1 は独立。2.2 を先に実装すると、2.3・2.4 のテストデータ投入に内部関数を利用できる。

- [ ] 2.1. delete-user-database-credentials の移行
  - 説明: DB 削除操作を内部関数に切り出し（`getDatabase` resolver 使用）、export 関数を `withDatabase` provider でラップする。テストを内部関数用に書き換える
  - 完了条件:
    - テスト: レコード存在時に削除されること
    - テスト: レコード非存在時にエラーにならないこと
    - 型: export 関数の型シグネチャが変わらないこと

- [ ] 2.2. save-user-database-credentials の移行
  - 説明: DB 保存操作（UPSERT）のみを内部関数に切り出し（暗号化は export 関数に残す）、export 関数を `withDatabase` provider でラップする。テストを内部関数（DB 操作のみ）用に書き換える。暗号化の検証は 3.1 の crypto.test.ts に移す
  - 完了条件:
    - テスト: 新規レコードが保存されること（暗号化なし、平文トークンで検証）
    - テスト: 同一 userId で UPSERT されること
    - 型: export 関数の型シグネチャが変わらないこと

- [ ] 2.3. get-user-database-credentials の移行
  - 説明: DB 取得操作を内部関数に切り出し（復号は export 関数に残す）、export 関数を `withDatabase` provider でラップする。テストを内部関数用に書き換える
  - 完了条件:
    - テスト: レコード存在時に DB の生データが返ること（復号なし）
    - テスト: レコード非存在時に NotFoundError が返ること
    - 型: export 関数の型シグネチャが変わらないこと

- [ ] 2.4. refresh-user-database-token の移行
  - 説明: DB 更新操作を内部関数に切り出し（暗号化は export 関数に残す）、export 関数を `withDatabase` provider でラップする。テストを内部関数用に書き換える
  - 完了条件:
    - テスト: トークンと有効期限が更新されること（暗号化なし）
    - テスト: DB 名・URL が変更されないこと
    - テスト: レコード非存在時にエラーが返ること
    - 型: export 関数の型シグネチャが変わらないこと

### 3. テストの補完

- [ ] 3.1. crypto.test.ts 新設
  - 説明: `crypto.ts` の `encrypt` / `decrypt` のラウンドトリップテストを作成する。既存テストから暗号化検証を移す
  - 完了条件:
    - テスト: encrypt → decrypt で元のテキストが復元されること
    - テスト: 異なる平文に対して異なる暗号文が生成されること（IV のランダム性）

- [ ] 3.2. get-valid-credentials テストの更新
  - 説明: データ投入を `saveUserDatabaseCredentials`（export、provider 付き）から内部関数（DB 操作のみ）+ `encrypt` 直接呼び出しに変更する
  - 完了条件:
    - テスト: 既存の3シナリオ（有効期限内・期限切れ・未存在）すべてパス

### 4. 最終検証

- [ ] 4.1. 静的検証
  - 説明: `pnpm type-check && pnpm lint && pnpm test` を実行し、すべてパスすることを確認する
  - 完了条件:
    - 確認: 上記コマンドがエラーなく完了すること

- [ ] 4.2. アプリ動作確認
  - 説明: テストは mockContext 経由で内部関数を検証するため、export 関数の `withDatabase` provider が本番で正しく DB を渡せるかはテストでカバーできない。ローカルでアプリを起動し、Per-User DB クレデンシャル関連の操作が正常に動作することを確認する
  - 完了条件:
    - 確認: サインイン後、Per-User DB を使う画面が正常に表示されること（provider 経由で DB 接続が成功している）

## 議論ログ

### ラウンド1: 設計判断

- Q: diva context の配置場所は？
- A: `helpers/database-context.ts`（既存の `helpers/get-database.ts` と同じディレクトリ）
- 判断: `helpers/database-context.ts` に配置

- Q: テストの書き換え範囲は？
- A: 内部関数（DB 操作のみ）のテストに書き換え + `crypto.test.ts` を新設。export 関数（provider 付き）のテストは書かない
- 判断: 内部関数テスト + crypto.test.ts 新設
