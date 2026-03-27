# Breakdown: per-user-database への diva curried provider 導入

## ステータス

- 状態: 確定
- 現在のフェーズ: 5/5（確定）
- 最終更新: 2026-03-27

## 要件サマリー

- 要件ドキュメント: `docs/development/2026-03-27-diva-per-user-database/01-requirements.md`
- スコープ: FR1〜FR6（diva context 定義、テスト基盤、apps/web 合成ヘルパー、全体検証）

## 設計概要

### 影響範囲

- packages/per-user-database: diva context 定義、テスト基盤追加
- apps/web: 合成ヘルパー追加

### アプローチ

- `packages/authentication` の diva database context パターンを踏襲
- `createContext<LibSQLDatabase<typeof schema>>()` で context を定義
- 合成ヘルパーのエラーハンドリングは `@praha/byethrow` の Result 型を使用

### 関連ADR

- なし（既存パターンの踏襲）

## タスクツリー

凡例:
- `[?]` 未展開（さらに分解が必要）
- `[ ]` 葉タスク（TDDで着手可能）
- `[x]` 完了

依存関係: 上から順に実装する。同じ階層内で依存がない場合は並行実装可能。

### 1. per-user-database の diva context 定義（FR1, FR2, FR3）

- [ ] 1.1. `@praha/diva` の依存追加と context 定義
  - 説明: `packages/per-user-database` に `@praha/diva` を追加し、`src/helpers/database-context.ts` に `getPerUserDatabase` / `withPerUserDatabase` を定義する。`package.json` の exports に `"./context"` エントリを追加する
  - 完了条件:
    - 型: `getPerUserDatabase` が `LibSQLDatabase<typeof schema>` を返す型であること
    - 型: `withPerUserDatabase` が `ProviderFn` 型に準拠すること
    - 型: `pnpm type-check` がパスすること

### 2. テスト基盤の整備（FR4）

> 1 に依存

- [ ] 2.1. スキーマ型付きインメモリ DB の作成
  - 説明: `src/testing/mocked-per-user-database.ts` を作成する。`packages/authentication` の `mocked-authentication-database.ts` と同様に、`drizzle(client, { schema })` でスキーマ型付きのインメモリ DB を提供する
  - 完了条件:
    - 型: `mockedPerUserDatabase` が `LibSQLDatabase<typeof schema>` 型であること
    - テスト: `beforeEach` でマイグレーションが実行され、テーブルが利用可能であること

- [ ] 2.2. mockContext ヘルパーの作成と re-export
  - 説明: `src/helpers/database-context.mock.ts` を作成し、`mockContext(withPerUserDatabase, () => mockedPerUserDatabase)` パターンを提供する。`src/testing/index.ts` から re-export する
  - 完了条件:
    - 型: mock ヘルパーが `withPerUserDatabase` の型と整合すること
    - 確認: `@next-lift/per-user-database/testing` からインポート可能であること

### 3. apps/web 合成ヘルパー（FR5）

> 1, 2 に依存

- [ ] 3.1. 合成ヘルパーの実装とテスト
  - 説明: `apps/web/src/libs/per-user-database/per-user-database-context.ts` に、userId を渡すだけで per-user DB スコープに入れる合成ヘルパーを作成する。`getValidCredentials` でクレデンシャルを取得し、`createPerUserDatabaseClientWithoutMigration` でクライアントを作成し、`withPerUserDatabase` スコープ内でコールバックを実行する。エラーハンドリングは Result 型で行う
  - 完了条件:
    - テスト: クレデンシャル取得成功時、コールバックが per-user DB スコープ内で実行されること
    - テスト: クレデンシャル取得失敗時、エラーが Result 型で返されること
    - 型: `pnpm type-check` がパスすること

### 4. 全体検証（FR6）

> 1, 2, 3 に依存

- [ ] 4.1. 全検証コマンドの実行
  - 説明: `pnpm type-check && pnpm lint && pnpm test` を実行し、既存テストを含めすべてパスすることを確認する
  - 完了条件:
    - 確認: `pnpm type-check && pnpm lint && pnpm test` が成功すること

### 5. アプリでの動作確認

> 4 に依存

- [ ] 5.1. 合成ヘルパーを使った動作確認
  - 説明: apps/web で合成ヘルパーを実際に使う簡易的なコード（server action 等）を書き、ブラウザから実行して per-user DB へのアクセスが正常に動作することを確認する。動作確認後、確認用コードは削除する
  - 完了条件:
    - 確認: ブラウザから合成ヘルパー経由で per-user DB にアクセスし、データの読み書きができること
    - 確認: エラーケース（存在しないユーザー等）で Result 型のエラーが返ること

## 議論ログ

### ラウンド1: エラーハンドリング方針

- Q: apps/web の合成ヘルパー（FR5）のエラーハンドリングについて、要件では保留とされているが、今回のタスク分解ではどう扱うか？
- A: Result 型で実装する（`@praha/byethrow` を使用）
- 判断: `getValidCredentials` のエラーを Result 型で呼び出し側に伝搬する形で実装する
