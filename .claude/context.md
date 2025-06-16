# プロジェクトコンテキスト

## プロジェクト概要

Next Liftは、ウェイトトレーニングの計画と記録を行うアプリケーションです。本プロジェクトでは以下の要素を重視しています：

- **iOSアプリ**: トレーニング中の疲労状態でも操作しやすい極限のUX
- **Webアプリ**: 統計データ分析とトレーニング計画作成に特化
- **データ同期**: ローカルファーストアーキテクチャでオフライン対応
- **技術実験場**: 新しいフレームワーク・ライブラリを試すためのプラットフォーム

## 技術スタック

### システム構成

```text
┌─────────────────┐    ┌──────────────────┐
│   Next.js Web   │────│   Hono Backend   │
│   (Frontend)    │    │ (Auth + DB管理)  │
└─────────────────┘    └──────────────────┘
         │                       │
┌─────────────────┐              │
│ React Native    │──────────────┘
│ (iOS Mobile)    │
└─────────────────┘
```

### プロジェクト構成

- **モノレポ**: pnpm workspaces + turborepo
- **設計原則**: 技術要素の疎結合化（フレームワーク置き換えを容易にする）

### バックエンド（Hono Server）

- **フレームワーク**: Hono
- **認証**: Better Auth（Apple ID、Google認証）
- **データベース**: Turso（Better Auth用 + Per-User Database管理）
- **ORM**: Drizzle ORM
- **デプロイ**: Cloudflare Workers/Node.js対応

### Webアプリ

- **フレームワーク**: Next.js (App Router)
- **対象デバイス**: PC（統計データ表示のため広画面想定）
- **データアクセス**: Drizzle ORM + Turso Embedded Replicas
- **認証**: Hono Backendと連携

### iOSアプリ

- **フレームワーク**: React Native
- **対象プラットフォーム**: iOSのみ（Android端末での検証環境なし）
- **データアクセス**: Drizzle ORM + op-sqlite + Turso Embedded Replicas
- **認証**: Better Auth（Expo SecureStore）
- **将来機能**: 音声・画像入力対応予定

### データベース構成

- **Better Auth用テーブル**: Tursoに配置（sessions, users, accounts等）
- **アプリデータ**: Per-User Turso Database
- **同期方式**: Embedded Replicas（読み取り高速化 + オフライン対応）
- **競合解決**: 後勝ち方式

## 制約・注意点

### 技術的制約

- **Embedded Replicas制限**: 同期中はローカルDB操作不可
- **React Native設定**: op-sqlite用にbabel、metro設定が必要
- **認証セッション**: クロスサブドメインクッキー設定が必要な場合あり
- **Android非対応**: Android端末での検証環境なし

### 開発環境制約

- **CI優先**: 手動確認を最小化し、なるべくすべてをCIで自動チェック
- **疎結合設計**: フレームワーク置き換えを容易にする技術選択
- **日本語ファースト**: コミットメッセージ、コメント、ドキュメントは日本語で記述

## データ構造（暫定）

- **種目**: 名前、鍛えられる筋肉・部位
- **トレーニング**: 日時、種目、セット詳細（重量、レップ数、RPE）、メモ

## 現在の開発状況

技術実現可能性確認済み。アーキテクチャ決定完了。インフラ構築段階（モノレポ環境、Hono Backend、Web/iOS/Turso連携基盤）への移行準備完了。
