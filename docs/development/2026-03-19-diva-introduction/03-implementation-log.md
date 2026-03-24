# TDD実装: packages/authentication の @praha/diva 導入

## ステータス

- 状態: 完了
- 最終更新: 2026-03-25

## ToDoリスト

### 1.1. 依存追加と `createDatabaseClient` リネーム

- ステータス: `done`
- 説明: `@praha/diva` を `packages/authentication` に追加する。`helpers/get-database.ts` の `getDatabase` を `createDatabaseClient` にリネームし、`create-auth.ts` の import を更新する
- 完了条件:
  - 型: `pnpm type-check` がパスすること
  - テスト: 既存テスト全パス（`vi.mock` のモジュールパスは変わらないため影響なし）
- メモ:

### 1.2. diva context 定義

- ステータス: `done`
- 説明: `helpers/database-context.ts` に `createContext` で `getDatabase` resolver と `withDatabase` provider を定義する。`createDatabaseClient()` を provider のファクトリとして使用する
- 完了条件:
  - 型: `getDatabase` が `LibSQLDatabase` を返す resolver として型が通ること
  - 型: `withDatabase` が provider 関数として型が通ること
- メモ:

### 1.3. テスト基盤の mockContext 移行

- ステータス: `done`
- 説明: `testing/setup.ts` の `vi.hoisted + vi.mock("../helpers/get-database")` を、`mockContext` による `getDatabase` resolver のモックに置き換える。`mockedAuthenticationDatabase` の export は維持する
- 完了条件:
  - テスト: 既存テスト全パス（モック方法が変わるだけで振る舞いは同じ）
- メモ: タスク3.2と統合して実施。`getValidCredentials` は内部関数を直接呼ぶため自身で provider ラップすべきでなく、`get-valid-credentials-provider.ts` で provider ラップした版を index.ts から export する構成に変更

### 2.1. delete-user-database-credentials の移行

- ステータス: `done`
- 説明: DB 削除操作を内部関数に切り出し（`getDatabase` resolver 使用）、export 関数を `withDatabase` provider でラップする。テストを内部関数用に書き換える
- 完了条件:
  - テスト: レコード存在時に削除されること
  - テスト: レコード非存在時にエラーにならないこと
  - 型: export 関数の型シグネチャが変わらないこと
- メモ: `CredentialsNotFoundOnDeleteError` を新設（ユーザー要望: 削除対象不在を区別可能にする）。`database-context.ts` の型を `LibSQLDatabase<Record<string, unknown>>` に変更（schema あり/なし両方を受け入れるため）

### 2.2. save-user-database-credentials の移行

- ステータス: `done`
- 説明: DB 保存操作（UPSERT）のみを内部関数に切り出し（暗号化は export 関数に残す）、export 関数を `withDatabase` provider でラップする。テストを内部関数（DB 操作のみ）用に書き換える。暗号化の検証は 3.1 の crypto.test.ts に移す
- 完了条件:
  - テスト: 新規レコードが保存されること（暗号化なし、平文トークンで検証）
  - テスト: 同一 userId で UPSERT されること
  - 型: export 関数の型シグネチャが変わらないこと
- メモ:

### 2.3. get-user-database-credentials の移行

- ステータス: `done`
- 説明: DB 取得操作を内部関数に切り出し（復号は export 関数に残す）、export 関数を `withDatabase` provider でラップする。テストを内部関数用に書き換える
- 完了条件:
  - テスト: レコード存在時に DB の生データが返ること（復号なし）
  - テスト: レコード非存在時に NotFoundError が返ること
  - 型: export 関数の型シグネチャが変わらないこと
- メモ:

### 2.4. refresh-user-database-token の移行

- ステータス: `done`
- 説明: DB 更新操作を内部関数に切り出し（暗号化は export 関数に残す）、export 関数を `withDatabase` provider でラップする。テストを内部関数用に書き換える
- 完了条件:
  - テスト: トークンと有効期限が更新されること（暗号化なし）
  - テスト: DB 名・URL が変更されないこと
  - テスト: レコード非存在時にエラーが返ること
  - 型: export 関数の型シグネチャが変わらないこと
- メモ:

### 3.1. crypto.test.ts 新設

- ステータス: `done`
- 説明: `crypto.ts` の `encrypt` / `decrypt` のラウンドトリップテストを作成する。既存テストから暗号化検証を移す
- 完了条件:
  - テスト: encrypt → decrypt で元のテキストが復元されること
  - テスト: 異なる平文に対して異なる暗号文が生成されること（IV のランダム性）
- メモ:

### 3.2. get-valid-credentials テストの更新

- ステータス: `done`（タスク1.3と統合して実施済み）
- 説明: データ投入を `saveUserDatabaseCredentials`（export、provider 付き）から内部関数（DB 操作のみ）+ `encrypt` 直接呼び出しに変更する
- 完了条件:
  - テスト: 既存の3シナリオ（有効期限内・期限切れ・未存在）すべてパス
- メモ:

### 4.1. 静的検証

- ステータス: `done`
- 説明: `pnpm type-check && pnpm lint && pnpm test` を実行し、すべてパスすることを確認する
- 完了条件:
  - 確認: 上記コマンドがエラーなく完了すること
- メモ:

### 4.2. アプリ動作確認

- ステータス: `done`
- 説明: テストは mockContext 経由で内部関数を検証するため、export 関数の `withDatabase` provider が本番で正しく DB を渡せるかはテストでカバーできない。ローカルでアプリを起動し、Per-User DB クレデンシャル関連の操作が正常に動作することを確認する
- 完了条件:
  - 確認: サインイン後、Per-User DB を使う画面が正常に表示されること（provider 経由で DB 接続が成功している）
- メモ:

### 5. 命名規則の統一

- ステータス: `done`
- 説明: diva 導入に伴うファイル分割で、関数の命名規則を整理した

#### 公開API: `{動詞}Credentials` / `{動詞}Token`

インポートパスが文脈を提供するため（`@next-lift/authentication` → `user-database-credentials/`）、関数名自体は簡潔にした。

| Before | After |
|--------|-------|
| `saveUserDatabaseCredentials` | `saveCredentials` |
| `getUserDatabaseCredentials` | `getCredentials` |
| `getValidCredentials` | `getValidCredentials`（変更なし） |
| `refreshUserDatabaseToken` | `refreshToken` |
| `deleteUserDatabaseCredentials` | `deleteCredentials` |

#### 内部関数（helpers/）: DB操作を動詞で表現

helpers/ の関数はDB操作のみを担当するため、SQL操作に対応する動詞を使う。

| 動詞 | SQL操作 | 関数 |
|------|---------|------|
| `find` | SELECT | `findCredentials` |
| `upsert` | INSERT ON CONFLICT UPDATE | `upsertCredentials` |
| `update` | UPDATE | `updateToken` |

#### コロケーション内部関数: 公開APIと区別する動詞

同じ機能ディレクトリ内の内部関数は、公開APIと名前が衝突しないよう別の動詞を使う。

| 公開API | 内部関数 | 理由 |
|---------|---------|------|
| `deleteCredentials` | `removeCredentials` | delete/remove で区別 |
| `getValidCredentials` | `resolveValidCredentials` | get/resolve で区別。resolve は「有効期限チェック → 必要なら更新 → 返却」という解決プロセスを表現 |

## 全体メモ

### 3層構造

diva 導入後の `user-database-credentials` は以下の3層構造になった。

```
公開API（index.ts re-export）
  └─ 機能ディレクトリ/index.ts: withAuthenticationDatabase + ビジネスロジック（暗号化等）
      └─ helpers/: DB操作のみ（getDatabase resolver使用）
         or 機能ディレクトリ内: コロケーション（1箇所でしか使わない内部関数）
```

- **公開API**: `withAuthenticationDatabase` provider でDBコンテキストを注入し、暗号化・復号化などのビジネスロジックを含む
- **helpers/**: `getDatabase` resolver 経由でDBにアクセスし、純粋なDB操作のみを行う。複数の公開APIから共有される
- **コロケーション内部関数**: 1つの公開APIからしか使わない内部関数（例: `removeCredentials`, `resolveValidCredentials`）は、その機能ディレクトリ内に配置する

### resolveValidCredentials の責務分析

`resolveValidCredentials` は以下のステップで構成されるオーケストレーション関数。

1. `findCredentials` でDBからクレデンシャルを取得
2. `decrypt` でトークンを復号化
3. 有効期限チェック（`expiresAt > now`）← 唯一の固有ロジック
4. 期限切れの場合: `issueToken` → `encrypt` → `updateToken` で更新

各ステップはすべて既存のhelper関数に委譲済みで、固有ロジックは期限チェックの1行のみ。これ以上分割すると `getCredentials`（find + decrypt）と処理が重複するため、現在の粒度が適切。

テスト戦略: 各helperは単体テスト済みのため、`resolveValidCredentials` は統合テストでオーケストレーション全体の連携を検証する。

