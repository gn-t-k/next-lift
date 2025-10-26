# ADR-006: Drizzle ORM

## ステータス

Accepted

## コンテキスト

Next LiftでTurso Databaseにアクセスするため、ORMを選定する必要があった。以下の要件があった:

- データベースの読み書き機能
- TypeScript完全サポート
- 発行されるSQLをコントロールしやすい
- 使い慣れたAPI

## 決定内容

ORMとして**Drizzle ORM**を採用する。

### 利用箇所

- Next.js (Web App): Turso接続
- React Native (iOS App): op-sqlite接続
- 共通スキーマ定義: `packages/per-user-database`、`packages/authentication`

## 結果・影響

### メリット

- 開発者が慣れている（仕事で使用経験あり）
- 発行されるSQLをコントロールしやすい
- `select().from()`のようなAPIが好み
- TypeScript完全サポート
- 軽量で高速
- Turso、op-sqlite両方に対応

### デメリット

- マイグレーション機能はPrismaより弱い
- コミュニティがPrismaより小さい

## 代替案

以下の選択肢を検討した:

### Prisma

- **却下理由**:
  - 独自のDSL(schema.prisma）があまり好きではない
  - Drizzleの`select().from()`のようなAPIがPrismaにはない
  - Drizzleの方が好み

### Kysely

- **検討内容**: 検討したが詳細な理由は記録なし

### TypeORM

- **検討内容**: 検討したが詳細な理由は記録なし

## 決定日

2025-10-19
