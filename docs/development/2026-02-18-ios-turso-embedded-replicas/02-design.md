# 設計: iOS Turso Embedded Replicas

## 概要

iOSアプリからTursoのEmbedded Replicas機能を利用し、Per-User DBのローカルレプリカを作成・同期する。サーバーAPIでクレデンシャルを取得し、op-sqliteの`openSync()`でローカルSQLiteとリモートTurso DBを接続する。

## 変更の方向性

### 影響範囲

- **apps/web**: クレデンシャル取得APIエンドポイントの追加
- **apps/ios**: DB接続・初期化ロジックの実装、Better Authカスタムプラグイン追加、旧drizzle関連ファイル削除
- **packages/authentication**: クレデンシャル取得+自動更新ロジックの追加（`getValidCredentials`）
- **packages/per-user-database**: `drizzle.config.ts` に `driver: "expo"` 追加、exportsの追加

### アプローチ

#### 1. クレデンシャル取得ロジック（packages/authentication）

**新規作成**: `get-valid-credentials.ts`

- `getUserDatabaseCredentials(userId)` でクレデンシャル取得
- トークン有効期限切れの場合: `issueToken`（`@next-lift/turso` 依存済み）で再発行 → `refreshUserDatabaseToken` でDBに保存 → 新トークンを返却
- 新規パッケージ依存は不要（既存依存のみで実現可能）

#### 2. クレデンシャル取得API（apps/web）

**新規作成**: `apps/web/src/app/api/per-user-database/credentials/route.ts`

- GETエンドポイント
- Better Authセッションで認証チェック
- `getValidCredentials(userId)` でクレデンシャル取得
- レスポンス: `{ url, authToken, expiresAt }` + `Cache-Control: no-store`

```text
iOS App → GET /api/per-user-database/credentials
       → Better Auth セッション検証
       → getValidCredentials(userId)
       → { url, authToken, expiresAt }
```

#### 3. iOS側のDB接続フロー

**新規作成**: `apps/ios/src/lib/per-user-database-plugin.ts` + `apps/ios/src/lib/database.ts`

- Better Authカスタムプラグイン（`getActions` 経由で `$fetch` を使用、公式推奨パターン）
- `authClient.getCredentials()` でAPI呼び出し（セッションCookieは `expoClient` プラグインが自動付与）

サインイン後のDB初期化フロー:

```text
1. expo-secure-storeからキャッシュ済みクレデンシャルを取得
2. キャッシュがない or 期限切れ → authClient.getCredentials() でAPI呼び出し
3. クレデンシャルをexpo-secure-storeにキャッシュ
4. openSync({ name, url, authToken, libsqlSyncInterval }) でDB接続
5. Drizzleクライアント作成 + migrate() でマイグレーション実行
```

**App.tsxの変更**: セッション確立後、DB初期化完了を待ってからHomeScreenを表示

```text
セッションなし → SignInScreen
セッションあり + DB未初期化 → DB初期化中（ローディング）
セッションあり + DB初期化済み → HomeScreen
```

#### 4. スキーマ・マイグレーションの集約

**方針**: `packages/per-user-database` にスキーマとマイグレーションを集約する

- **packages/per-user-database の変更**:
  - 既存 `drizzle.config.ts` に `driver: "expo"` を追加（SQLファイルに加えて `migrations.js` も生成されるようになる）
  - `package.json` の exports に `"./migrations"` を追加
- **apps/ios から削除**:
  - `apps/ios/db/`（テスト用スキーマ）
  - `apps/ios/drizzle/`（テスト用マイグレーション）
  - `apps/ios/drizzle.config.ts`
- **iOS側のマイグレーション実行**: `drizzle-orm/op-sqlite/migrator` の `migrate()` 関数（非Hook版）で `@next-lift/per-user-database/migrations` を使用
- **注意**: `babel-plugin-inline-import` がワークスペースパッケージ内の `.sql` ファイルを解決できるか、実装時に検証する

### 使用する既存モジュール

| モジュール | 用途 |
| --- | --- |
| `@next-lift/authentication` の `getUserDatabaseCredentials` | クレデンシャル取得 |
| `@next-lift/authentication` の `refreshUserDatabaseToken` | トークン更新 |
| `@next-lift/turso` の `issueToken` | 新トークン発行 |
| `@next-lift/per-user-database` の `database-schemas` | スキーマ定義 |
| `@next-lift/per-user-database` の `migrations` | マイグレーション（Expo形式） |
| `expo-secure-store` | クレデンシャルのセキュアなキャッシュ |

## 関連ADR

- ADR-007: op-sqliteの採用（libSQLサポート）
- ADR-010: Local-first Architecture
- ADR-020: Per-User DB実装詳細（トークン管理）

新規ADRは不要（既存ADRの設計方針に沿った実装のため）。

## 合意事項

- [x] ユーザー承認済み
