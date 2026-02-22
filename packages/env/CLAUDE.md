# packages/env

環境変数の定義と取得を担うパッケージ。Zodスキーマによる型安全な環境変数のバリデーションと、static/dynamicの2段階検証を提供する。

## 機能

| 提供機能 | 説明 |
| --- | --- |
| private環境変数 | `./private` からimport。`env`オブジェクト |
| public環境変数 | `./public` からimport。`publicEnv`オブジェクト（`NEXT_PUBLIC_`プレフィックス） |
| テスト用モック関数 | `./testing` からimport。`mockPrivateEnv`, `mockPublicEnv` |
| 環境変数の検証 | `pnpm check` で実行 |

## 使い方

### private環境変数の取得

```typescript
import { env } from "@next-lift/env/private";

const token = env.TURSO_PLATFORM_API_TOKEN;
const org = env.TURSO_ORGANIZATION;
```

### public環境変数の取得

```typescript
import { publicEnv } from "@next-lift/env/public";

const url = publicEnv.NEXT_PUBLIC_APP_URL;
```

### テストでのモック利用

モック関数はenvパッケージ内にコロケーション配置されており、`@next-lift/env/testing` から利用する。モック関数内部で `vi.hoisted` + `vi.mock` を処理するため、利用側はインポートして呼び出すだけでよい。

```typescript
import { mockPrivateEnv } from "@next-lift/env/testing";

// テストのセットアップで必要な環境変数のみ設定
mockPrivateEnv({ TURSO_PLATFORM_API_TOKEN: "test-token" });
```

## 開発ガイド

### static/dynamic環境変数の分離

Next.jsのSSGではビルド時に環境変数が必要だが、プレビュー環境のURLなどビルド時に確定しない値がある。この問題を解決するため、検証タイミングを2段階に分離している。

- **staticEnvSchema**: モジュール読込時に即座に検証。ビルド時に確定する変数（認証関連、インフラ関連、監視関連、環境識別子など）
- **dynamicEnvSchema**: `lazy=true`の場合、プロパティアクセス時に検証。実行時に確定する変数（`BETTER_AUTH_URL`、`TURSO_AUTH_DATABASE_URL`など）

### Proxyパターン

`parseEnv`関数は`lazy=true`の場合、Proxyオブジェクトを返す。

- staticキーへのアクセス: パース済みの結果を即座に返す（dynamic検証をトリガーしない）
- dynamicキーへのアクセス: 初回アクセス時にdynamicEnvSchemaの検証を実行し、結果をキャッシュ
- 制約: `ownKeys`トラップ未実装のため、`Object.keys`や`for...in`による列挙は不可

### テスト環境

- `mockPrivateEnv` / `mockPublicEnv`: Proxyベースのモック。指定したキーの値を返し、未指定キーへのアクセスはエラーをスロー
- `vi.hoisted`でモックオーバーライドを初期化し、`vi.mock`でモジュールを差し替え
- テスト側は`mockPrivateEnv({ KEY: "value" })`の形で必要な環境変数のみ設定
