# 要件定義: iOS Turso Embedded Replicas

## 要望（Goals）

- iOSアプリでトレーニングデータをローカルに保持し、高速に読み書きできるようにしたい
- オフラインでもデータにアクセスでき、オンライン復帰時に自動同期されるようにしたい
- Web/iOS間でデータが一貫して同期される状態にしたい

## 要求（Requests）

- TursoのEmbedded Replicas機能（op-sqliteのlibSQLサポート経由）を使い、Per-User DBとローカルSQLiteを同期させる
- サインイン後にPer-User DBのクレデンシャル（URL、authToken）を取得し、接続を確立する
- packages/per-user-databaseのスキーマをiOSアプリでも利用する
- Drizzle ORMでデータ操作できるようにする

## 調査結果

### コードベース調査

#### 現在のiOSアプリ（apps/ios/）の状態

- op-sqlite 15.2.5がインストール済み
- Drizzle ORM設定は `driver: "expo"` でローカルSQLiteのみ
- `db/schema.ts` はテスト用の簡易スキーマ（「本格的なスキーマはper-user-databaseパッケージで定義予定」とコメントあり）
- `babel-plugin-inline-import` で `.sql` ファイルのインポートが可能
- `libsql: true` の設定は未追加

#### Per-User DB クレデンシャル管理（packages/authentication/）

- `per_user_database` テーブルにURL・暗号化トークン・有効期限を保存
- `getUserDatabaseCredentials(userId)` で取得・復号して返す（サーバーサイド関数）
- `refreshUserDatabaseToken(userId)` でトークン更新可能
- **iOS向けのAPIエンドポイントは未実装**

#### Web側のPer-User DB利用（apps/web/）

- Better Auth の `databaseHooks.user.create.after` で初回サインアップ時にDB作成
- APIエンドポイントは `/api/auth/[...all]` のみ（Per-User DB向けは未実装）

### 外部調査

#### op-sqlite Embedded Replicas API（v15.2.5）

```typescript
import { openSync } from '@op-engineering/op-sqlite';

const db = openSync({
  name: 'local.sqlite',           // ローカルファイル名
  url: 'libsql://xxx.turso.io',   // リモートDB URL
  authToken: '...',                // 認証トークン
  libsqlSyncInterval: 60,         // 自動同期間隔（秒）
});

db.sync();  // 手動同期（同期関数、Promiseではない）
```

- `package.json` に `"op-sqlite": { "libsql": true }` が必要
- `openSync()` を使用（通常の `open()` ではなく）
- `libsqlSyncInterval` の単位は秒

#### Drizzle ORM + op-sqlite

```typescript
import { drizzle } from 'drizzle-orm/op-sqlite';

const db = drizzle(sqlite); // openSync()の戻り値を渡す
```

## 要件（Requirements）

### 機能要件

1. **クレデンシャル取得APIの実装**
   - iOSアプリがサインイン後にPer-User DBのURL・authTokenを取得できるAPIエンドポイントを作成
   - 認証済みユーザーのみアクセス可能（Better Authセッション検証）
   - トークン有効期限切れ時はサーバー側でTurso Platform APIから再発行して返す（ADR-020の決定に基づく）

2. **op-sqlite Embedded Replicas接続**
   - `openSync()` でローカルSQLiteとリモートTurso DBを接続
   - `libsqlSyncInterval` による自動同期
   - 手動 `sync()` 呼び出しのサポート

3. **Drizzle ORM統合**
   - `drizzle-orm/op-sqlite` アダプターでDrizzleクライアントを作成
   - `packages/per-user-database` のスキーマを利用（iOS独自スキーマは廃止）
   - 接続時のマイグレーション自動実行

4. **スキーマ共有**
   - `packages/per-user-database` のスキーマをiOSアプリから参照
   - iOS用の `drizzle.config.ts` を更新

### 非機能要件

- オフライン時もローカルDBからの読み取りが可能であること
- トークンはセキュアに保存すること（expo-secure-store）
- ネットワーク復帰時に自動的に同期が再開されること

## スコープ外

- Web側でのPer-User DBデータ操作UI（フェーズ2で実装）
- Web/iOS間のデータ同期確認（別タスクとして手動確認）

## 合意事項

- [x] ユーザー承認済み
