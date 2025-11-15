# ADR-018: t3-envを使用した環境変数管理

## ステータス

Accepted

## コンテキスト

Next Liftプロジェクトでは、環境変数の管理に以下の課題があった:

### 既存の課題

1. **型安全性の欠如**
   - 環境変数の型が`string | undefined`で型安全性がない
   - `as string`などの型アサーションが多用されている
   - ビルド時に環境変数の欠落を検出できない

2. **コードの冗長性**
   - 実行環境に関する説明コメントが多い
   - 型アサーションの繰り返し
   - 環境変数アクセスのパターンが統一されていない

3. **ドキュメント化の不足**
   - 必要な環境変数が明示的に定義されていない
   - 環境変数の用途や要件が不明確

### 既存のアーキテクチャ決定

- [ADR-011](./011-monorepo-environment-variables.md): シンボリックリンク方式による環境変数の一元管理
- [ADR-012](./012-database-environment-strategy.md): データベース環境戦略
- [ADR-009](./009-pnpm-monorepo.md): pnpm Monorepo構成

## 決定内容

**t3-env (@t3-oss/env-nextjs, @t3-oss/env-core) を使用して環境変数を型安全に管理する。**

### アーキテクチャ: `packages/env`で一元管理

```text
packages/
  └── env/
      ├── src/
      │   ├── libs/
      │   │   └── shared-config.ts  # 共通設定（runtimeEnv, skipValidation等）
      │   ├── turso.ts                # Tursoデータベース（サーバーのみ）
      │   ├── authentication.ts       # Better Auth + Google OAuth（サーバーのみ）
      │   ├── sentry.ts               # Sentry（サーバーのみ）
      │   └── index.ts                # 統合エクスポート
      └── package.json

apps/web/src/env.ts → packages/envから全てをimport・統合（クライアント変数も定義）
packages/authentication → packages/envから必要な環境変数をimport
```

### 設計判断

#### 1. packages/env配下はサーバー環境変数のみ定義

- `@t3-oss/env-core`を使用（Next.js非依存）
- クライアント環境変数（`NEXT_PUBLIC_*`）は各アプリで定義
- 理由: フレームワーク交換容易性（ADR-009の疎結合設計）

#### 2. 共通設定の抽出

- `libs/shared-config.ts`に`runtimeEnv`, `skipValidation`, `emptyStringAsUndefined`を集約
- `skipValidation`はlint時のみスキップ（CI環境でも環境変数バリデーションを実施）
- 理由: DRY原則、保守性向上（変更が1箇所で完結）、CI環境での設定漏れ検出

#### 3. DATABASE_PROVIDERによる明示的なDB選択

- `turso.ts`に`DATABASE_PROVIDER: z.enum(["local", "turso"])`を必須化
- Turso認証情報も必須化（開発環境ではダミー値を使用）
- 理由: 本番環境での設定忘れによる誤ったローカルDB使用を防止

#### 4. apps/web/src/env.ts

```typescript
import { createEnv } from "@t3-oss/env-nextjs";
import {
  authenticationEnv,
  sentryEnv,
  tursoEnv,
} from "@next-lift/env";

export const env = createEnv({
  extends: [tursoEnv(), authenticationEnv(), sentryEnv()],
  server: {},
  client: {
    NEXT_PUBLIC_BETTER_AUTH_URL: z.url(),
    NEXT_PUBLIC_SENTRY_DSN: z.url(),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_BETTER_AUTH_URL: process.env["NEXT_PUBLIC_BETTER_AUTH_URL"],
    NEXT_PUBLIC_SENTRY_DSN: process.env["NEXT_PUBLIC_SENTRY_DSN"],
  },
});
```

#### 5. next.config.ts

```typescript
import "./src/env"; // ビルド時に環境変数を検証
```

#### 6. 環境変数の使用

```typescript
import { authenticationEnv } from "@next-lift/env/authentication";

const env = authenticationEnv();

export const auth = betterAuth({
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,  // 型安全、型アサーション不要
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
});
```

## 結果・影響

### メリット

1. **型安全性の向上**
   - ビルド時に環境変数の欠落を検出
   - 自動補完による開発体験の向上
   - `string | undefined`ではなく正確な型推論

2. **コードの品質向上**
   - 型アサーション（`as string`）の削除
   - 実行環境に関する説明コメントの削減
   - 環境変数アクセスパターンの統一

3. **ドキュメント化**
   - `packages/env`が環境変数の定義書として機能
   - zodスキーマで要件が明示的（URL、最小長等）
   - 環境変数の用途がファイル名で明確

4. **DRY原則の徹底**
   - Web App、iOS App、authenticationパッケージで環境変数を共有
   - 定義の重複を完全排除
   - 変更が1箇所で完結

5. **保守性の向上**
   - 環境変数の追加・変更が`packages/env`で完結
   - 影響範囲が明確
   - リファクタリングが容易

6. **拡張性の確保**
   - iOS App追加時に`packages/env`をimportするだけ
   - 新しいアプリケーションへの対応が容易
   - フレームワーク変更時も環境変数定義は影響を受けない

7. **既存方針との一貫性**
   - ADR-011のシンボリックリンク方式と共存
     - シンボリックリンク: 値の一元管理（`.env`ファイル）
     - t3-env: 型定義の一元管理（`packages/env`）
   - ADR-009の疎結合設計を強化
   - ADR-012のデータベース環境戦略を型安全に実装

### デメリット

1. **依存関係の追加**
   - `@t3-oss/env-core`: 39.6kB
   - `@t3-oss/env-nextjs`: 39.7kB
   - `zod`: 112kB
   - 合計: 約190kB（開発依存関係、ランタイムへの影響は限定的）

2. **学習コスト**
   - t3-envの概念理解が必要
   - zodスキーマの記述方法の学習
   - ただし、公式ドキュメントが充実しており、学習コストは低い

3. **ビルド時検証の副作用**
   - 環境変数が不足している場合、ビルドが失敗
   - CI/CD環境では`skipValidation`で回避可能
   - 開発環境では`.env.example`から`.env`を作成すれば解決

## 代替案

### 1. 各パッケージ/アプリに個別配置 + extendsパターン

create-t3-turboで採用されているパターン。

**構成:**

```text
packages/authentication/src/env.ts → @t3-oss/env-core
apps/web/src/env.ts → authenticationパッケージを継承
```

**メリット:**

- シンプルな構成
- パッケージの責任範囲が明確

**却下理由:**

- Web App、iOS App、authenticationで同じ環境変数（Turso、Better Auth）を使用
- 環境変数の重複定義が発生する
- `packages/env`で一元管理する方がDRY原則に適合
- Next Liftの規模（apps 2つ、packages 5つ程度）では`packages/env`の方が適切

### 2. 環境変数管理ライブラリを使わない

現状維持。`process.env`を直接使用。

**メリット:**

- 依存関係なし
- 学習コスト不要

**却下理由:**

- 型安全性の課題が解決されない
- ビルド時検証ができない
- コードの冗長性が残る
- 長期的な保守性が低い

## 決定日

2025-01-14
