# TDD実装: iOS環境変数バリデーション

## ステータス

- 状態: 完了
- 最終更新: 2026-03-10

## ToDoリスト

### 1. Zodスキーマ定義とenvオブジェクトのエクスポート

- ステータス: `done`
- 説明: `apps/ios/src/env/index.ts` にZodスキーマを定義し、`process.env` をパースした結果を `env` としてエクスポートする
- 完了条件:
  - テスト: 有効な環境変数でパースが成功し、各プロパティにアクセスできること
  - テスト: 環境変数が未設定の場合にZodErrorがthrowされること
  - 型: `env` オブジェクトの各プロパティが `string` 型であること
- メモ: スキーマ名を `iosEnvSchema` にリネーム（Web側スキーマとの一貫性）

### 2. プレビルド検証スクリプトの作成

- ステータス: `done`
- 説明: `apps/ios/src/env/check.ts` を作成し、envモジュールをimportすることでバリデーションを実行する。`package.json` に `check` スクリプトを追加する
- 完了条件:
  - テスト: 有効な環境変数で成功メッセージが出力されること
  - テスト: 無効な環境変数でプロセスが非ゼロ終了すること
- メモ: tsx devDependency追加。ProcessEnv型の制約のため `as unknown as NodeJS.ProcessEnv` でキャスト

### 3. envモジュールのモック関数を作成

- ステータス: `done`
- 説明: 他のモジュールのテストで `env` をモックできるように、`apps/ios/src/env/env.mock.ts` にモック関数を作成する。`packages/env` のモックパターン（`vi.hoisted` + `vi.mock` + Proxy）に倣う
- 完了条件:
  - テスト: `mockEnv` で指定した値が `env` オブジェクトから取得できること
  - 型: `mockEnv` の引数が環境変数のキーに型安全であること
- メモ: モック自体のテストは不要（他パッケージも書いていない）。タスク4のリファクタリングで動作検証する

### 4.1. `auth-client.ts` をenvモジュール経由に変更

- ステータス: `done`
- 説明: `process.env["EXPO_PUBLIC_API_URL"]` の直接参照と手動nullチェックを、`env.EXPO_PUBLIC_API_URL` に置き換える
- 完了条件:
  - テスト: 既存テストがenvモック経由で引き続きパスすること
  - 確認: `process.env` の直接参照が除去されていること
- メモ: 計画通り完了

### 4.2. `get-google-id-token.ts` をenvモジュール経由に変更

- ステータス: `done`
- 説明: `process.env["EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID"]` と `process.env["EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID"]` の直接参照を、envモジュール経由に置き換える
- 完了条件:
  - テスト: 既存テストがenvモック経由で引き続きパスすること
  - 確認: `process.env` の直接参照が除去されていること
- メモ: native-mocks.tsにenvグローバルモックを追加。env.test.tsにvi.unmockを追加してグローバルモックを解除

### 4.3. `per-user-database-plugin.ts` をenvモジュール経由に変更

- ステータス: `done`
- 説明: `process.env["EXPO_PUBLIC_API_URL"]` の直接参照と手動nullチェックを、`env.EXPO_PUBLIC_API_URL` に置き換える
- 完了条件:
  - テスト: 既存テストがenvモック経由で引き続きパスすること
  - 確認: `process.env` の直接参照が除去されていること
- メモ: 計画通り完了

## 全体メモ

- envモジュールのグローバルモックを `native-mocks.ts` に追加（`vi.mock("../env/env")`）。env.test.tsでは `vi.unmock` で解除
- `env.mock.ts` のvi.mockパスは相対パスのため、利用箇所によってパスが変わる。native-mocks.tsに直接記述する方式を採用
