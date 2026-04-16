# Next Lift

筋トレの計画と記録を統合するアプリケーション。

## 解決する課題

スプレッドシートでの計画作成（1RM管理、%計算、RPE）と、別ツールでの記録が分断されている。
計画に最適化されたUIで立てた計画が、そのまま記録のベースになる体験を提供する。

## 開発ロードマップ

### Phase 1: ペルソナモデルと行動シナリオの準備 [done]

- [persona-model.md](./ui-design/persona-model.md)
- [behavioral-scenarios.md](./ui-design/behavioral-scenarios.md)

### Phase 2: UI設計（MBUD）

ペルソナ・行動シナリオをもとに、mbudスキルでUI設計の成果物を作成する。

### Phase 3: テーブル設計（ERD）

UI設計の成果物をもとに、erd-designスキルでデータモデルを設計する。

### Phase 4: データアクセス層の実装

テーブル設計をもとに、per-user-databaseパッケージのDrizzleスキーマを実装する。

### Phase 5: アプリケーション機能の実装

UI設計とデータアクセス層をもとに、機能を実装する。実装順序は別途計画。

## 技術スタック

| カテゴリ | 技術 |
|---------|------|
| Web | Next.js |
| iOS | React Native (Expo) |
| DB | Turso (Per-User Database) |
| ORM | Drizzle |
| 認証 | Better Auth |
| UI | React Aria Components (Intent UI) + Tailwind CSS v4 |
| モノレポ | pnpm workspace + Turborepo |
| デプロイ | Vercel |

各技術の選定理由は [ADR](../architecture-decision-record/overview.md) を参照。

## 関連ドキュメント

- [ADR](../architecture-decision-record/overview.md) - 技術的な意思決定の記録
