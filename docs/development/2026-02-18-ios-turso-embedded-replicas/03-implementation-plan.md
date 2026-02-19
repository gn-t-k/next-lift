# 実装計画: iOS Turso Embedded Replicas

## 依存関係の全体像

```text
タスク1: drizzle.configにdriver:"expo"追加 (packages/per-user-database)
タスク2: クレデンシャル取得ロジック (packages/authentication)  ←並行可能→  タスク1
    ↓
タスク3: クレデンシャル取得APIエンドポイント (apps/web)
    ↓
タスク4: iOS DB初期化モジュール (apps/ios)
    ↓
タスク5: App.tsx統合 + 旧ファイル削除
```

## タスク一覧

### タスク1: packages/per-user-database のdrizzle.configに `driver: "expo"` を追加しmigrations.jsを生成

- 内容:
  - 既存の `packages/per-user-database/drizzle.config.ts` に `driver: "expo"` を追加
  - `pnpm db:generate` を実行して `drizzle/migrations.js` を自動生成（既存SQLファイルはそのまま、migrations.jsが追加されるだけ）
  - `packages/per-user-database/package.json` の exports に `"./migrations": "./drizzle/migrations.js"` を追加
  - `babel-plugin-inline-import` がワークスペースパッケージ内の `.sql` を解決できるか検証
- 検証方法: 型チェック + タスク4での統合的な手動確認
- 依存: なし

### タスク2: クレデンシャル取得ロジックの実装（packages/authentication）

- 内容:
  - `packages/authentication/src/features/user-database-credentials/get-valid-credentials.ts` を新規作成
  - 処理: `getUserDatabaseCredentials(userId)` → 期限内ならそのまま返却、期限切れなら `issueToken` + `refreshUserDatabaseToken` で再発行して返却
  - テスト容易性のため `now` パラメータを受け取る設計
  - 既存の `getUserDatabaseCredentials`, `issueToken`（`@next-lift/turso`依存済み）, `refreshUserDatabaseToken` を組み合わせる
  - `packages/authentication/src/features/user-database-credentials/get-valid-credentials.test.ts` を新規作成
  - テスト構造:
    - クレデンシャルが存在しトークンが有効な場合 → そのまま返すこと
    - クレデンシャルが存在しトークンが期限切れの場合 → 新トークンを発行して返すこと / DBに保存されること
    - クレデンシャルが存在しない場合 → エラーを返すこと
  - モック: `getUserDatabaseCredentials`, `issueToken`, `refreshUserDatabaseToken` を `vi.spyOn` でスパイ
  - `packages/authentication/package.json` の exports に公開パスを追加
- 検証方法: テスト + 型チェック
- 依存: なし（タスク1と並行可能）

### タスク3: クレデンシャル取得APIエンドポイントの実装（apps/web）

- 内容:
  - `apps/web/src/app/api/per-user-database/credentials/route.ts` を新規作成
  - GETエンドポイント: Better Authセッション検証 → `getValidCredentials(userId)` → JSONレスポンス
  - HTTPステータス: 認証なし→401、クレデンシャル未発見→404、その他エラー→500
  - セキュリティ: レスポンスに `Cache-Control: no-store` ヘッダーを含める
- 検証方法: 型チェック + ビルド確認 + 手動確認（curl / iOS Simulator）
- 依存: タスク2

### タスク4: iOS DB初期化モジュールの実装（apps/ios）

- 内容:
  - Better Authカスタムプラグインの作成: `apps/ios/src/lib/per-user-database-plugin.ts`
    - `getActions` 経由で `$fetch` を使い、`GET /api/per-user-database/credentials` を呼び出す `getCredentials` アクションを定義
    - `authClient` のプラグインに登録し、`authClient.getCredentials()` で呼び出せるようにする
  - `apps/ios/src/lib/database.ts` を新規作成
  - 処理フロー: expo-secure-storeからキャッシュ取得 → キャッシュなし/期限切れなら `authClient.getCredentials()` でAPI呼び出し → キャッシュ保存 → `openSync()` でEmbedded Replicas接続 → Drizzleクライアント作成 → `migrate()` でマイグレーション実行
  - スキーマ: `@next-lift/per-user-database/database-schemas` からインポート
  - マイグレーション: `@next-lift/per-user-database/migrations` からインポート
  - マイグレーション: `drizzle-orm/op-sqlite/migrator` の `migrate` 関数（非Hook版）を使用
- 検証方法: 型チェック + 手動確認（iOS Simulator）
- 依存: タスク1、タスク3

### タスク5: App.tsx統合 + 旧ファイル削除

- 内容:
  - `apps/ios/App.tsx` の変更: セッション確立後にDB初期化、完了までローディング表示
  - `apps/ios/src/lib/database-context.tsx` を新規作成（React ContextでDBクライアントを提供）
  - 旧ファイルの削除:
    - `apps/ios/db/schema.ts`
    - `apps/ios/drizzle/`（migrations.js, SQL, meta/）
    - `apps/ios/drizzle.config.ts`
  - `apps/ios/package.json` の `db:generate` スクリプト削除
- 検証方法: 型チェック + lint + 手動確認（iOS Simulator: サインイン→DB初期化→HomeScreen表示）
- 依存: タスク4

## 実装上のリスクと対応方針

### リスク1: babel-plugin-inline-importのワークスペース解決

ワークスペースパッケージ内の `.sql` を解決できない可能性がある。

**対応方針**: タスク1で早期検証。解決できない場合は `migrations.js` 内でSQLを文字列リテラルとして直接記述する代替案。

## 調査済み事項

- **Better Auth Expo fetch**: カスタムプラグインの `getActions` 経由で `$fetch` を使用する（公式推奨パターン）。`expoClient` の `init` フックが `expo-secure-store` からCookieを読み取り、`Cookie` ヘッダー + `expo-origin` ヘッダーを自動設定する。
- **drizzle-orm/op-sqlite/migrator**: `migrate` 関数（非Hook版、`Promise<void>`）が存在し、`useMigrations` と同じモジュールからエクスポートされている。コンポーネント外で命令的に呼び出せる。
- **libsql設定**: ルートの `package.json` に `"op-sqlite": { "libsql": true }` は設定済み。追加作業は不要。

## 合意事項

- [x] ユーザー承認済み
