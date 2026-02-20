# packages/utilities

汎用ユーティリティ関数を提供するパッケージ。遅延初期化、ID生成、リトライ処理など、複数のパッケージから共通利用される基盤機能を集約する。

## エクスポート構成

| エクスポートパス | 機能 |
| --- | --- |
| `./create-lazy-proxy` | 遅延初期化Proxy |
| `./generate-id` | nanoidベースのID生成 |
| `./with-retry` | リトライ処理 + 指数バックオフ |

## 各ユーティリティの詳細

### createLazyProxy

初回アクセス時に初期化関数を実行し、結果をキャッシュする遅延初期化Proxy。

- **用途**: 環境変数オブジェクトやBetter Authインスタンスなど、重い初期化処理の遅延実行
- **動作**: `Proxy`の`get`トラップで初回アクセスを検知し、`initializer()`を実行。2回目以降はキャッシュされたインスタンスを返す
- **制約**: `T extends object`のみ対応（プリミティブ型は不可）

### generateId

nanoidベースのID生成関数。

- **文字セット**: `0-9a-z`（36文字）
- **長さ**: 12文字
- **依存**: `nanoid`パッケージの`customAlphabet`を使用

### withRetry / exponentialBackoff

リトライ処理とバックオフ戦略。

- **withRetry**: 非同期関数を指定回数までリトライ。失敗時にバックオフ関数で待機してから再試行する
  - `maxRetries`: 最大リトライ回数（デフォルト: 3）
  - `backoff`: リトライ間隔を計算する関数（`attempt`番号を受け取り、待機ミリ秒を返す）
- **exponentialBackoff**: 指数バックオフ戦略を生成するファクトリ関数
  - `initialDelayMs * 2^attempt` で待機時間を計算
  - 例: `exponentialBackoff(100)` → 100ms, 200ms, 400ms, ...

## テスト

- `with-retry.test.ts` でリトライ動作を検証
