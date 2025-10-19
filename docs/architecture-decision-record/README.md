# Architecture Decision Records (ADR)

このディレクトリには、Next Liftプロジェクトの重要な技術的決定を記録したArchitecture Decision Records (ADR）が含まれています。

## ADRとは

ADRは、プロジェクトで行われた重要なアーキテクチャ上の決定を記録するドキュメントです。各ADRには以下の情報が含まれます:

- **ステータス**: Accepted / Proposed / Deprecated
- **コンテキスト**: なぜこの決定が必要だったか
- **決定内容**: 何を決定したか
- **結果・影響**: この決定がもたらす結果
- **代替案**: 検討した他の選択肢
- **決定日**: いつ決定したか

## ADR一覧

### アプリケーション層

- [001: React Native (iOS App)](./001-react-native-for-ios.md)
- [002: Next.js (Web App + API)](./002-nextjs-for-web-and-api.md)

### 認証

- [003: Better Auth](./003-better-auth.md)

### データベース・データアクセス

- [004: Turso Database](./004-turso-database.md)
- [005: Per-User Database Architecture](./005-per-user-database-architecture.md)
- [006: Drizzle ORM](./006-drizzle-orm.md)
- [007: op-sqlite （iOS SQLiteドライバー）](./007-op-sqlite-for-ios.md)

### デプロイメント

- [008: Vercel Deployment](./008-vercel-deployment.md)

### 開発環境・ツール

- [009: pnpm + Monorepo](./009-pnpm-monorepo.md)

### アーキテクチャパターン

- [010: Local-first Architecture](./010-local-first-architecture.md)

## 新しいADRの追加

新しいADRを追加する場合は、`/adr` slash commandを使用してください。

```plaintext
/adr
```

このコマンドは、新しいADRの作成をガイドし、自動的に `system-architecture.md` も更新します。
