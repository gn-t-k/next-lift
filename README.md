# Next Lift

筋トレの計画と記録を統合するアプリケーション。

## 技術スタック

Next.js / React Native (Expo) / Turso / Drizzle / Better Auth / React Aria Components / Tailwind CSS v4

## セットアップ

```sh
pnpm install
```

## 開発コマンド

| コマンド | 説明 |
|---------|------|
| `pnpm type-check` | 型チェック |
| `pnpm lint` | Biomeによるリント |
| `pnpm test` | テスト実行 |
| `pnpm build` | ビルド |

## プロジェクト構造

```text
apps/
  web/   # Webアプリケーション
  ios/   # iOSアプリケーション

packages/
  env/                 # 環境変数の定義と取得
  utilities/           # 汎用ユーティリティ関数
  turso/               # Turso Platform APIとの通信
  authentication/      # 認証とPer-User DBトークン管理
  per-user-database/   # Per-User DBの作成とアクセス
  react-components/    # 共通UIコンポーネント
  tailwind-config/     # 共通スタイル定義
```

## ドキュメント

- [開発計画](docs/project/overview.md)
- [ADR](docs/architecture-decision-record/overview.md)
