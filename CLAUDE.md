# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

**プロジェクトの詳細概要・機能・開発ステータスは [README.md](./README.md) を参照してください。**

Next Liftは、ウェイトトレーニングの計画と記録を行うアプリケーションです。このドキュメントでは技術的な詳細と開発ガイドラインを提供します。

## 開発方針・ルール

- **協働開発**：ユーザーとClaudeによる設計・実装の協働
- **最新情報の活用**：常に最新のドキュメントと技術情報をもとに計画・開発を進める
- **疎結合設計**：フレームワーク置き換えを容易にする技術選択
- **継続的改善**：仕様と実装の反復的改善
- **ドキュメント管理**：
  - 技術詳細・開発ガイドライン → CLAUDE.md
  - プロジェクト概要・機能・ステータス → README.md
  - **定期的セルフレビュー**：重要な決定後はCLAUDE.md/README.mdを自動的にレビュー・更新
- **日本語ファースト**：コミットメッセージ、コメント、ドキュメントは日本語で記述
- **継続性の確認**：「今回だけじゃなくて今後も同じっぽい」指示があった場合、「CLAUDE.mdに追記しますか」と確認する

## ドキュメント更新対象

ユーザーが以下について言及した場合、CLAUDE.mdとREADME.mdを更新する：

- アプリの仕様について
- 開発の計画や方針について
- アーキテクチャの決定事項
- ユーザーエクスペリエンスに関する考慮事項

## アーキテクチャ概要

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

### アーキテクチャ決定理由

- **Hono Backend採用**：Next.js Route Handlersでは認証・Turso Per-User Database管理が複雑
- **統合型認証**：別途認証サーバー不要、HonoがBetter Auth + Turso管理を担当
- **Turso統一DB**：Better Auth用データもTursoで管理（SQLite互換でローカル開発・テスト容易）

## 技術スタック

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

### データ構造（暫定）

- **種目**: 名前、鍛えられる筋肉・部位
- **トレーニング**: 日時、種目、セット詳細（重量、レップ数、RPE）、メモ

## アプリ設計思想

- **iOSアプリ**: トレーニング中の疲労状態でも操作しやすい極限のUX
- **Webアプリ**: 統計データ分析とトレーニング計画作成に特化
- **データ同期**: ローカルファーストアーキテクチャでオフライン対応
- **技術実験場**: 新しいフレームワーク・ライブラリを試すためのプラットフォーム

## 技術実現可能性（調査済み）

### ✅ Better Auth クロスプラットフォーム認証

- **統合型アーキテクチャ**：別途認証サーバー不要、Hono内に直接統合
- **共通バックエンド**：WebアプリとiOSアプリが同じBetter Authインスタンスを参照
- **セッション管理**：
  - Web：HTTPOnlyクッキー（7日間、自動更新）
  - iOS：Expo SecureStore（セッショントークン保存）
- **OAuth対応**：Apple ID、Google認証両方サポート

### ✅ Turso Embedded Replicas データ同期

- **React Native対応**：op-sqliteライブラリで実装確認済み
- **Drizzle ORM対応**：React Native + op-sqlite + Drizzle完全サポート
- **Live Query機能**：リアルタイムデータ更新対応
- **リアルタイム同期**：書き込み後即座にローカル反映
- **高速読み取り**：マイクロ秒レベルのローカル読み取り
- **オフライン対応**：ネットワーク切断時も動作継続

### ✅ Drizzle ORM統一

- **Web**: Turso Embedded Replicas直接接続
- **iOS**: op-sqliteドライバー使用
- **Hono**: Turso直接接続
- **型安全性**: TypeScript完全対応
- **マイグレーション**: 統一されたスキーマ管理

### ⚠️ 注意点

- **Embedded Replicas制限**：同期中はローカルDB操作不可
- **React Native設定**：op-sqlite用にbabel、metro設定が必要
- **認証セッション**：クロスサブドメインクッキー設定が必要な場合あり

## 開発計画

### Phase 1: インフラ構築

- モノレポ環境構築（pnpm workspaces + turborepo）
- Hono Backend基盤構築
- Better Auth設定
- Turso Database設定
- Web/iOS/Turso連携の基盤整備

### Phase 2: 基本機能実装

- 認証システム（Apple ID、Google認証）
- 基本的なデータ記録・表示機能
- データ同期機能

### Phase 3: 機能拡張

- 統計データ分析機能
- トレーニング計画作成機能
- 音声・画像入力機能（将来）

## 現在の状況

技術実現可能性確認済み。アーキテクチャ決定完了。インフラ構築段階（モノレポ環境、Hono Backend、Web/iOS/Turso連携基盤）への移行準備完了。
