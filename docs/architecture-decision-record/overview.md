# Next Lift System Architecture

このドキュメントは、Next Liftシステムの全体アーキテクチャの概要を説明します。

技術的な決定の詳細については、[Architecture Decision Records (ADR)](./architecture-decision-record/README.md)を参照してください。

## システム概要

Next Liftは、筋トレの計画と記録を管理するシステムです。iOS AppとWeb Appの2つのアプリケーションで構成されています。

### 主な機能

- **iOS App**
  - Apple ID、Google認証
  - トレーニング記録・計画のCRUD
  - オフライン対応とデータ同期（Local-first設計）
  - 疲労時でも使いやすいUX
  - AI機能（自由記述、音声入力 - プレミアム機能）

- **Web App**
  - Apple ID、Google認証
  - トレーニング記録・計画のCRUD
  - 大画面向け統計データ表示・フィルタリング
  - AI機能（自由記述、音声入力 - プレミアム機能）

## アーキテクチャ図

```text
┌─────────────────────────────────────────────────────────────┐
│                    Next.js (Vercel)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │   Web App    │  │  Better Auth │  │  API Routes     │  │
│  │    (RSC)     │  │  (統合)      │  │  (Per-User DB   │  │
│  │              │  │              │  │   作成)         │  │
│  └──────────────┘  └──────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ↓
                ┌───────────────────────┐
                │  Authentication DB    │
                │      (Turso)          │
                └───────────────────────┘
                            │
              ┌─────────────┴──────────────┐
              ↓                            ↓
┌──────────────────────┐      ┌──────────────────────┐
│  Per-User DB (User A)│      │  Per-User DB (User B)│
│      (Turso)         │      │      (Turso)         │
└──────────────────────┘      └──────────────────────┘
       ↓ (Embedded Replica)        ↓ (Embedded Replica)
┌──────────────────────┐      ┌──────────────────────┐
│  iOS App (User A)    │      │  iOS App (User B)    │
│  - React Native      │      │  - React Native      │
│  - op-sqlite         │      │  - op-sqlite         │
│  - Drizzle ORM       │      │  - Drizzle ORM       │
│  - Local SQLite      │      │  - Local SQLite      │
└──────────────────────┘      └──────────────────────┘
```

## 技術スタック

### iOS App

- **フレームワーク**: React Native ([ADR-001](./architecture-decision-record/001-react-native-for-ios.md))
- **認証**: Better Auth + `@better-auth/expo` ([ADR-003](./architecture-decision-record/003-better-auth.md))
- **データベース**: Turso Embedded Replicas (Per-User Database) ([ADR-004](./architecture-decision-record/004-turso-database.md), [ADR-005](./architecture-decision-record/005-per-user-database-architecture.md))
- **SQLiteドライバー**: op-sqlite ([ADR-007](./architecture-decision-record/007-op-sqlite-for-ios.md))
- **ORM**: Drizzle ORM ([ADR-006](./architecture-decision-record/006-drizzle-orm.md))
- **Local-first**: Turso Embedded Replicas ([ADR-010](./architecture-decision-record/010-local-first-architecture.md))
- **開発環境**: Expo Development Build（op-sqlite使用のため）

### Web App

- **フレームワーク**: Next.js（App Router + RSC）([ADR-002](./architecture-decision-record/002-nextjs-for-web-and-api.md))
- **認証**: Better Auth（Next.js統合）([ADR-003](./architecture-decision-record/003-better-auth.md))
- **データベース**: Turso（Per-User Database）([ADR-004](./architecture-decision-record/004-turso-database.md), [ADR-005](./architecture-decision-record/005-per-user-database-architecture.md))
- **ORM**: Drizzle ORM ([ADR-006](./architecture-decision-record/006-drizzle-orm.md))
- **デプロイ**: Vercel ([ADR-008](./architecture-decision-record/008-vercel-deployment.md))

### API層

- **実装**: Next.js Route Handlers ([ADR-002](./architecture-decision-record/002-nextjs-for-web-and-api.md))
- **機能**:
  - 認証エンドポイント（Better Auth統合）
  - Per-User Database作成（Turso Platform API経由）
  - Database Token発行

### データベース

- **Authentication Database**: Turso ([ADR-004](./architecture-decision-record/004-turso-database.md))
  - ユーザー情報、セッション情報を管理
- **Per-User Databases**: Turso ([ADR-005](./architecture-decision-record/005-per-user-database-architecture.md))
  - ユーザーごとに独立したデータベースインスタンス
  - 最大10,000ユーザー（Turso Scalerプラン制約）
  - iOS App: Embedded Replicas（ローカル同期）
  - Web App: リモートDatabase

## パッケージ管理

Next Liftは**pnpm**を使用したMonorepo構成です。([ADR-009](./architecture-decision-record/009-pnpm-monorepo.md))

```text
/apps
  ├── ios                          # iOS app (React Native)
  └── web                          # Web app (Next.js)
/packages
  ├── react-components             # Web用共通コンポーネント
  ├── react-native-components      # iOS用共通コンポーネント
  ├── per-user-database            # Per-User DBスキーマ + クライアント
  └── auth-database                # 認証DBスキーマ + クライアント
```

## Local-first アーキテクチャ

Next LiftはLocal-first Architectureを採用しています。([ADR-010](./architecture-decision-record/010-local-first-architecture.md))

### 仕組み

- **読み取り**: ローカルSQLiteから（マイクロ秒単位、ネットワーク遅延ゼロ）
- **書き込み**: リモートTurso Databaseへ送信→自動同期
- **同期**: Turso Embedded Replicasによる自動同期（syncInterval設定可能）
- **オフライン対応**: ローカルDBで動作、オンライン時に自動同期

### メリット

- ネットワーク環境に左右されないハイパフォーマンス
- オフライン対応
- ユーザー体験の大幅な向上

## 認証フロー

1. **ユーザー登録/ログイン**
   - iOS App / Web App → Next.js (Better Auth)
   - Apple ID or Google認証
   - Authentication Databaseにユーザー情報保存

2. **Per-User Database作成**(初回ログイン時）
   - Next.js Route Handlers → Turso Platform API
   - ユーザー専用Databaseを作成
   - Database Token発行
   - クライアントへToken返却

3. **データアクセス**
   - iOS App: Embedded Replica(ローカルSQLite + Turso同期）
   - Web App: リモートTurso Database

## セキュリティ

- **認証**: Better Auth (Apple ID, Google認証）
- **セッション管理**: expo-secure-store (iOS）, Cookie (Web）
- **データ分離**: Per-User Database構成（ユーザーごとに独立したDB）
- **通信**: HTTPS (Vercel, Turso）

## スケーラビリティ

- **現在の制約**: 最大10,000ユーザー(Turso Scalerプラン）
- **想定**: 個人開発のため、10,000ユーザー到達の可能性は低い
- **将来的な対応**: 必要に応じてPowerSync等への移行を検討

## 関連ドキュメント

- [Architecture Decision Records (ADR)](./architecture-decision-record/README.md) - 技術的決定の詳細
- [プロジェクト概要](./project.md) - Next Liftプロジェクト全体の概要
