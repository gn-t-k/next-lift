# packages/env

環境変数の定義と取得を担うパッケージ。Zodスキーマによる型安全な環境変数のバリデーションと、static/dynamicの2段階検証を提供する。

## 機能

| パス | 説明 |
| --- | --- |
| `./private` | サーバーサイド用環境変数（`env`オブジェクト） |
| `./public` | クライアントサイド用環境変数（`publicEnv`オブジェクト、`NEXT_PUBLIC_`プレフィックス） |
| `./testing` | モック関数（`mockPrivateEnv`, `mockPublicEnv`） |
| `pnpm check` | すべての環境変数が正しく設定されているか検証 |

## 使い方

### サーバーサイドでの環境変数取得

```typescript
import { env } from "@next-lift/env/private";

// サーバーサイドコードで環境変数を使用
const token = env.TURSO_PLATFORM_API_TOKEN;
const org = env.TURSO_ORGANIZATION;
```

### クライアントサイドでの環境変数取得

```typescript
import { publicEnv } from "@next-lift/env/public";

// クライアントサイドコードで環境変数を使用（NEXT_PUBLIC_プレフィックスのみ）
const url = publicEnv.NEXT_PUBLIC_APP_URL;
```

### テストでのモック利用

```typescript
import { mockPrivateEnv, mockPublicEnv } from "@next-lift/env/testing";

// vi.hoisted + vi.mock と組み合わせて使用
const mockEnv = vi.hoisted(() => ({
  override: undefined as Parameters<typeof mockPrivateEnv>[0] | undefined,
}));

vi.mock("@next-lift/env/private", () => ({
  env: mockPrivateEnv(mockEnv.override),
}));

// テスト内で特定の環境変数のみ設定
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

### publicEnvの制約

Next.jsでは`NEXT_PUBLIC_`プレフィックスの環境変数がビルド時にインライン化される。`process.env`をオブジェクトとしてそのまま渡すとインライン化されないため、`process.env["NEXT_PUBLIC_XXX"]`の形で個別に参照する必要がある。

### privateEnvの.envファイル読み込み

`private.ts`はモジュール読込時に`.env`ファイルの自動読み込みを試みる。以下の条件で動作が分岐する。

- **Node.js環境**: `process.loadEnvFile`で`.env`を読み込み
- **Edge Runtime**: `process.loadEnvFile`が存在しないためスキップ
- **CI/Vercel**: `.env`ファイルが存在しないため、catchでスキップ
- **Next.js build**: `import.meta.dirname`がundefinedのためスキップ（Next.jsが読み込み済み）

### テスト環境

- `mockPrivateEnv` / `mockPublicEnv`: Proxyベースのモック。指定したキーの値を返し、未指定キーへのアクセスはエラーをスロー
- `vi.hoisted`でモックオーバーライドを初期化し、`vi.mock`でモジュールを差し替え
- テスト側は`mockPrivateEnv({ KEY: "value" })`の形で必要な環境変数のみ設定
