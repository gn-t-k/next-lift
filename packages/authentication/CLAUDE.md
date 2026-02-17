# packages/authentication

Better Authを使った認証とPer-User DBクレデンシャル管理を担うパッケージ。

## アーキテクチャ

- **Better Auth統合**: OAuth認証（Apple ID、Google）をBetter Authで一元管理（ADR-003）
- **Authentication Database**: 認証情報専用のTursoデータベース（ユーザー、アカウント、セッション）
- **Per-User DBクレデンシャル**: 各ユーザーのDB接続情報（URL、暗号化トークン、有効期限）を認証DBに保存

## エクスポート構成

| エクスポートパス | 機能 |
| --- | --- |
| `./create-auth` | Better Authインスタンス生成（OAuthプロバイダー、フック設定） |
| `./user-database-credentials` | Per-User DBクレデンシャルのCRUD |
| `./integrations/better-auth-nextjs` | Next.js向けBetter Auth統合 |
| `./integrations/better-auth-react` | React/Expo向けBetter Auth統合 |

## データベーススキーマ

| テーブル | 用途 |
| --- | --- |
| `user` | Better Auth標準。ユーザー情報（email, name等） |
| `account` | OAuthプロバイダー接続（Google, Apple）。user削除時CASCADE |
| `session` | セッショントークン管理。user削除時CASCADE |
| `verification` | メール検証コード |
| `per_user_database` | Per-User DB接続情報。userIdはユニークだが**外部キーなし**（ADR-019: ユーザー削除時もDB情報を保持） |

## Account Linking（ADR-019）

- 同一メールアドレスで異なるプロバイダーからログインした場合、自動的に同一アカウントにリンク
- `trustedProviders: ["google", "apple"]` — メール検証済みプロバイダーのみ自動リンク
- セキュリティ担保: 未検証のプロバイダーではリンクしない

## ユーザー削除（ADR-019）

- 認証データのみ削除（user, account, sessionテーブル — CASCADE）
- Per-User Databaseは保持（誤削除時のデータ復旧のため）
- `per_user_database` テーブルにFKを張らない理由: ユーザー削除時にDB情報が消えることを防ぐ

## トークン暗号化

- Per-User DBのJWTトークンをAES-256-GCMで暗号化して保存
- IV: 12バイト、Auth Tag: 16バイト
- Base64エンコード: `iv(12) + tag(16) + encrypted`
- 暗号化キー: 環境変数 `TURSO_TOKEN_ENCRYPTION_KEY`（256ビットhex文字列）

## Apple OAuth

- Apple OAuthの `clientSecret` は静的文字列ではなく、ES256 JWTを動的に生成
- 有効期限: 約170日（Appleの上限180日未満）
- form_postコールバックのため `SameSite=None` + `Secure` が必須

## マルチプラットフォーム対応

- **Web（Next.js）**: `nextCookies()` プラグインでCookieベースのセッション管理
- **iOS（Expo）**: `@better-auth/expo` プラグイン + `expo-secure-store` でセッション永続化

## 既知のリスクと制約

- **Account Linking**: 信頼されたプロバイダー以外でのリンクはセキュリティリスク
- **トークン暗号化キーの漏洩**: Per-User DBの全トークンが復号可能になる
- **Apple秘密鍵の管理**: 有効期限（180日）内のローテーションが必要
- **セッション管理**: Cookie属性（SameSite, Secure）の設定ミスでCSRFリスク

## テスト環境

- インメモリSQLite + Drizzle ORMでモック
- `vi.hoisted()` でモック前にDB初期化
- `beforeEach` でテーブルドロップ + マイグレーション再実行
- ファクトリ: `users`, `sessions`, `accounts`, `perUserDatabases`
- 暗号化キーはテスト用の固定値（`"0".repeat(64)`）
