# ADR-002: Next.js （Web App + API）

## ステータス

Accepted

## コンテキスト

Next LiftのWeb Appと認証APIを開発するにあたり、どのフレームワークを使用するか決定する必要があった。以下の要件があった:

- RSCを使って、データフェッチやミューテーションをReactコンポーネントとコロケーションさせたい
- WebとiOS両方で共通の認証データベースを参照する必要がある
- Per-User Database作成などのAPI機能が必要

## 決定内容

Web App + API層のフレームワークとして**Next.js**を採用する。

### 構成

- **Web App**: Next.js App Router + React Server Components
- **API層**: Next.js Route Handlers
- **認証**: Better Auth（Next.js統合）
- **Per-User Database作成**: Route Handlersで実装

## 結果・影響

### メリット

- RSC（React Server Components）でデータフェッチとコロケーション可能
- Route Handlersで認証APIを実装できる
- Better AuthのNext.js統合が成熟している
- Expo/React Nativeからの利用も公式サポート
- 同一ドメインで動作、CORS設定不要
- デプロイがVercel 1箇所で完結

### デメリット

- Next.jsに依存する
- Next.jsがダウンするとiOS Appの認証も停止

## 代替案

以下の選択肢を検討した:

### React Router v7以降

- **却下理由**: RSC対応が出たばかりで不安、Next.jsのRSCは仕事で書き慣れている

### Hono on Next.js

- **検討内容**: Route Handlersに直接ロジックを書く抵抗感があった
- **却下理由**: 現時点でのAPI数が少なく、Honoのルーティング機能が活きるほどの規模ではない。シンプルさを優先

### 独立したHono API Server

- **検討内容**: フロントエンドとバックエンドの完全分離
- **却下理由**:
  - デプロイ先が2箇所になる
  - CORS設定が必要
  - Per-User Database作成はどちらにせよサーバー側で実行する必要がある
  - インフラがシンプルな方が良い

## 決定日

2025-10-19
