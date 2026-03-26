# TDD実装: packages/turso の @praha/diva 導入

## ステータス

- 状態: 完了
- 最終更新: 2026-03-26

## ToDoリスト

### 1.1. 依存追加と fetch context 定義

- ステータス: `done`
- 説明: `@praha/diva` を `packages/turso` に追加し、`helpers/fetch-context.ts` に `getFetch` resolver、`withFetch` provider、`withTursoFetch` composed provider を定義する
- 完了条件:
  - 型: `getFetch` が `typeof fetch` を返す resolver として型が通ること
  - 型: `withTursoFetch` が `withFetch(() => globalThis.fetch)` として型が通ること
- メモ:

### 2.1. create-database + get-database の移行

- ステータス: `done`
- 説明: `create-database.ts` と `get-database.ts` で `fetch` を `getFetch()` に置き換え、`createDatabase` を `withTursoFetch` でラップする（`getDatabase` は内部関数のためラップ不要）。テストで `globalThis.fetch` 差し替えを `mockContext` に置き換え、409 テストは `vi.spyOn(getDatabase)` を廃止して fetch モック連鎖（`mockResolvedValueOnce`）に統一する
- 完了条件:
  - テスト: 正常系（201）で DB 情報が返されること
  - テスト: 409 Conflict で getDatabase 経由で既存 DB 情報が返されること（fetch 連鎖で検証）
  - テスト: 409 後に getDatabase が失敗した場合のエラーハンドリング
  - テスト: 409 後に getDatabase で DB が見つからない場合のエラーハンドリング
  - テスト: 500 エラー、ネットワークエラーが適切にハンドリングされること
  - 型: export 関数の型シグネチャが変わらないこと
- メモ:

### 2.2. issue-token の移行

- ステータス: `done`
- 説明: `issue-token.ts` で `fetch` を `getFetch()` に置き換え、`issueToken` を `withTursoFetch` でラップする。テストで `globalThis.fetch` 差し替えを `mockContext` に置き換える
- 完了条件:
  - テスト: 有効期限付きトークン発行が正常に動作すること
  - テスト: 無期限トークン発行が正常に動作すること
  - テスト: 500 エラー、ネットワークエラーが適切にハンドリングされること
  - 型: export 関数の型シグネチャが変わらないこと
- メモ:

### 2.3. delete-database の移行

- ステータス: `done`
- 説明: `delete-database.ts` で `fetch` を `getFetch()` に置き換え、`deleteDatabase` を `withTursoFetch` でラップする。テストで `globalThis.fetch` 差し替えを `mockContext` に置き換える
- 完了条件:
  - テスト: 正常系（200）で成功が返されること
  - テスト: 404 エラーで DatabaseNotFoundError が返されること
  - テスト: 500 エラー、ネットワークエラーが適切にハンドリングされること
  - 型: export 関数の型シグネチャが変わらないこと
- メモ:

### 2.4. list-databases の移行

- ステータス: `done`
- 説明: `list-databases.ts` で `fetch` を `getFetch()` に置き換え、`listDatabases` を `withTursoFetch` でラップする。テストで `globalThis.fetch` 差し替えを `mockContext` に置き換える
- 完了条件:
  - テスト: 複数 DB の一覧が返されること
  - テスト: 空の一覧が返されること
  - テスト: 500 エラー、ネットワークエラー、不正レスポンスが適切にハンドリングされること
  - 型: export 関数の型シグネチャが変わらないこと
- メモ:

### 3.1. 静的検証

- ステータス: `done`
- 説明: `pnpm type-check && pnpm lint && pnpm test` を実行し、すべてパスすることを確認する
- 完了条件:
  - 確認: 上記コマンドがエラーなく完了すること
- メモ:

## 全体メモ
