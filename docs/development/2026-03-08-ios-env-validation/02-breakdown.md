# Breakdown: iOS環境変数バリデーション

## ステータス

- 状態: 確定
- 現在のフェーズ: 5/5（レビューと確定）
- 最終更新: 2026-03-10

## 要件サマリー

- 要件ドキュメント: `docs/development/2026-03-08-ios-env-validation/01-requirements.md`
- 関連Issue: #553
- スコープ: iOS側の環境変数（3つ）にZodスキーマベースのバリデーションを導入し、既存の手動nullチェックを置き換える

### 対象環境変数

- `EXPO_PUBLIC_API_URL`（`auth-client.ts`, `per-user-database-plugin.ts` で使用）
- `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`（`get-google-id-token.ts` で使用）
- `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`（`get-google-id-token.ts` で使用）

## 設計概要

### 影響範囲

- apps/ios: envモジュール新規作成、既存3ファイルのリファクタリング
- packages/: 変更なし

### アプローチ

- **即座パース方式**: モジュールimport時にZodで即座にパースし、結果をエクスポート。Proxy不使用（iOS環境変数はすべてビルド時にMetroがインライン展開するため、遅延検証のメリットなし）
- **シンプルなcheckスクリプト**: envモジュールをimportするだけのスクリプト。import時にバリデーションが走るため追加ロジック不要（byethrow ROPパターンは検証対象が1つのみのため過剰）
- 配置: `apps/ios/src/env/` ディレクトリに新規作成

### 関連ADR

- ADR-011: Monorepo環境変数管理（ルート`.env`のシンボリックリンク方式）

## タスクツリー

凡例:
- `[?]` 未展開（さらに分解が必要）
- `[ ]` 葉タスク（TDDで着手可能）
- `[x]` 完了

依存関係: 上から順に実装する。同じ階層内で依存がない場合は並行実装可能。

### 1. envモジュールの作成

- [ ] 1.1. Zodスキーマ定義とenvオブジェクトのエクスポート
  - 説明: `apps/ios/src/env/index.ts` にZodスキーマを定義し、`process.env` をパースした結果を `env` としてエクスポートする
  - 完了条件:
    - テスト: 有効な環境変数でパースが成功し、各プロパティにアクセスできること
    - テスト: 環境変数が未設定の場合にZodErrorがthrowされること
    - 型: `env` オブジェクトの各プロパティが `string` 型であること

### 2. checkスクリプトの作成

- [ ] 2.1. プレビルド検証スクリプトの作成
  - 説明: `apps/ios/src/env/check.ts` を作成し、envモジュールをimportすることでバリデーションを実行する。`package.json` に `check` スクリプトを追加する
  - 完了条件:
    - テスト: 有効な環境変数で成功メッセージが出力されること
    - テスト: 無効な環境変数でプロセスが非ゼロ終了すること

### 3. テスト用モック関数の作成

- [ ] 3.1. envモジュールのモック関数を作成
  - 説明: 他のモジュールのテストで `env` をモックできるように、`apps/ios/src/env/env.mock.ts` にモック関数を作成する。`packages/env` のモックパターン（`vi.hoisted` + `vi.mock` + Proxy）に倣う
  - 完了条件:
    - テスト: `mockEnv` で指定した値が `env` オブジェクトから取得できること
    - 型: `mockEnv` の引数が環境変数のキーに型安全であること

### 4. 既存使用箇所のリファクタリング

タスク4.1〜4.3は並行実装可能。

- [ ] 4.1. `auth-client.ts` をenvモジュール経由に変更
  - 説明: `process.env["EXPO_PUBLIC_API_URL"]` の直接参照と手動nullチェックを、`env.EXPO_PUBLIC_API_URL` に置き換える
  - 完了条件:
    - テスト: 既存テストがenvモック経由で引き続きパスすること
    - 確認: `process.env` の直接参照が除去されていること

- [ ] 4.2. `get-google-id-token.ts` をenvモジュール経由に変更
  - 説明: `process.env["EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID"]` と `process.env["EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID"]` の直接参照を、envモジュール経由に置き換える
  - 完了条件:
    - テスト: 既存テストがenvモック経由で引き続きパスすること
    - 確認: `process.env` の直接参照が除去されていること

- [ ] 4.3. `per-user-database-plugin.ts` をenvモジュール経由に変更
  - 説明: `process.env["EXPO_PUBLIC_API_URL"]` の直接参照と手動nullチェックを、`env.EXPO_PUBLIC_API_URL` に置き換える
  - 完了条件:
    - テスト: 既存テストがenvモック経由で引き続きパスすること
    - 確認: `process.env` の直接参照が除去されていること

## 議論ログ

### ラウンド1: 設計判断

- Q1: バリデーション方式 — 即座パース vs Proxy方式？
- A1: 即座パース（iOS環境変数はすべてビルド時確定のため、Proxyのメリットなし）
- Q2: checkスクリプト — シンプルなスクリプト vs byethrow ROPパターン？
- A2: シンプルなスクリプト（検証対象が1つのみで、ROPパターンは過剰）
