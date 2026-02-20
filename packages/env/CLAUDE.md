# packages/env

環境変数の定義と取得を担うパッケージ。Zodスキーマによる型安全な環境変数のバリデーションと、static/dynamicの2段階検証を提供する。

## アーキテクチャ

- **Zodスキーマ**: 環境変数をZodスキーマで定義し、型安全に検証
- **static/dynamic分離**: ビルド時に確定する変数（static）と、実行時に確定する変数（dynamic）を分離
- **Proxyパターン**: `lazy=true`の場合、dynamicスキーマの検証をプロパティアクセス時まで遅延（キャッシュあり）
- **エラーフォーマット**: セキュリティのため、検証エラーには環境変数の値を含めない

## エクスポート構成

| エクスポートパス | 機能 |
| --- | --- |
| `./private` | サーバーサイド用環境変数（`env`オブジェクト） |
| `./public` | クライアントサイド用環境変数（`publicEnv`オブジェクト、`NEXT_PUBLIC_`プレフィックス） |
| `./testing` | モック関数（`mockPrivateEnv`, `mockPublicEnv`） |

## static/dynamic環境変数の分離

Next.jsのSSGではビルド時に環境変数が必要だが、プレビュー環境のURLなどビルド時に確定しない値がある。この問題を解決するため、検証タイミングを2段階に分離している。

### staticEnvSchema

モジュール読込時に即座に検証される。ビルド時に確定する変数を定義。

- 認証関連: `BETTER_AUTH_SECRET`, `GOOGLE_CLIENT_ID`, `APPLE_CLIENT_ID`など
- インフラ関連: `TURSO_PLATFORM_API_TOKEN`, `TURSO_ORGANIZATION`など
- 監視関連: `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN`
- 環境識別: `APP_ENV`（`production | ci | development-{name} | preview-pr{n}`）

### dynamicEnvSchema

`lazy=true`の場合、プロパティアクセス時に検証される。実行時に確定する変数を定義。

- `BETTER_AUTH_URL`: プレビュー環境のURLがブランチごとに変わるため
- `TURSO_AUTH_DATABASE_URL`, `TURSO_AUTH_DATABASE_AUTH_TOKEN`: プレビュー環境ごとにDBを作成するため

## Proxyパターンの詳細

`parseEnv`関数は`lazy=true`の場合、Proxyオブジェクトを返す。

- **staticキーへのアクセス**: パース済みの結果を即座に返す（dynamic検証をトリガーしない）
- **dynamicキーへのアクセス**: 初回アクセス時にdynamicEnvSchemaの検証を実行し、結果をキャッシュ
- **制約**: `ownKeys`トラップ未実装のため、`Object.keys`や`for...in`による列挙は不可
- **ZodEffects対応**: `superRefine`/`refine`/`transform`を含むスキーマにも対応

## publicEnvの制約

Next.jsでは`NEXT_PUBLIC_`プレフィックスの環境変数がビルド時にインライン化される。`process.env`をオブジェクトとしてそのまま渡すとインライン化されないため、`process.env["NEXT_PUBLIC_XXX"]`の形で個別に参照する必要がある。

## privateEnvの.envファイル読み込み

`private.ts`はモジュール読込時に`.env`ファイルの自動読み込みを試みる。以下の条件で動作が分岐する。

- **Node.js環境**: `process.loadEnvFile`で`.env`を読み込み
- **Edge Runtime**: `process.loadEnvFile`が存在しないためスキップ
- **CI/Vercel**: `.env`ファイルが存在しないため、catchでスキップ
- **Next.js build**: `import.meta.dirname`がundefinedのためスキップ（Next.jsが読み込み済み）
- **Next.js dev**: 既にNext.jsが読み込み済みだが、再設定しても影響なし

## CLIツール

`pnpm check`（`tsx src/features/check/index.ts`）で、すべての環境変数が正しく設定されているか検証できる。private/publicの両方のスキーマを検証し、失敗時はエラー詳細を出力して終了する。

## テスト環境

- `mockPrivateEnv` / `mockPublicEnv`: Proxyベースのモック。指定したキーの値を返し、未指定キーへのアクセスはエラーをスロー
- `vi.hoisted`でモックオーバーライドを初期化し、`vi.mock`でモジュールを差し替え
- テスト側は`mockPrivateEnv({ KEY: "value" })`の形で必要な環境変数のみ設定
- `createMockEnv`ヘルパー: 未モックの環境変数へのアクセスを検出するProxyを生成
