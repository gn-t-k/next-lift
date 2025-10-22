# ADR-003: Better Auth

## ステータス

Accepted

## コンテキスト

Next Liftの認証システムを実装するにあたり、どの認証ライブラリを使用するか決定する必要があった。以下の要件があった:

- WebとiOS両方で使える認証システム
- Apple ID、Google認証をサポート
- コストを抑えたい（無料が望ましい）
- 評判が良いライブラリを使いたい

## 決定内容

認証ライブラリとして**Better Auth**を採用する。

### 認証方式

- Apple ID認証
- Google認証

### 統合方法

- **サーバー側**: Next.js Route Handlers (`toNextJsHandler`)
- **Web App**: Better Auth Reactクライアント
- **iOS App**: `@better-auth/expo` プラグイン
- **セッション管理**: expo-secure-store(iOS）、Cookie（Web）

## 結果・影響

### メリット

- 無料で使用できる
- コミュニティでの評判が良い
- Next.jsとの統合が成熟している（`toNextJsHandler`）
- Expo/React Nativeからの利用を公式サポート（`@better-auth/expo`）
- Apple ID、Google認証をサポート
- TypeScript完全サポート
- セッション管理、CSRF保護等のセキュリティ機能が組み込み

### デメリット

- 比較的新しいライブラリ（NextAuthほど成熟していない）
- Vercel Preview Deploymentsで`trustedOrigins`設定が必要

## 代替案

以下の選択肢を検討した:

### NextAuth (Auth.js)

- **検討内容**: 仕事で使用経験あり
- **却下理由**: 最近Better Authに吸収されたというニュースがあった

### Auth0

- **検討内容**: 仕事で使用経験あり
- **却下理由**: 使いやすいとは言えない

### Clerk、Supabase Auth

- **却下理由**: 管理画面が増えるのが嫌、コスト懸念

## 決定日

2025-10-19
