# Breakdown: packages/turso の @praha/diva 導入

## ステータス

- 状態: 確定
- 現在のフェーズ: 5/5
- 最終更新: 2026-03-26

## 要件サマリー

- 要件ドキュメント: `docs/development/2026-03-25-diva-per-user-database/01-requirements.md`
- スコープ: `packages/turso` の `globalThis.fetch` 手動差し替えパターンを diva の `mockContext` に置き換える

## 設計概要

### 影響範囲

- packages/turso: 主な変更対象（実装5ファイル + テスト4ファイル + context定義1ファイル）
- apps/web: 変更不要（mock ファイルの公開インターフェースを維持するため）
- packages/per-user-database: 変更不要（同上）
- packages/authentication: 変更不要（同上）

### アプローチ

- `helpers/fetch-context.ts` に diva context（`getFetch` resolver + `withFetch` provider + `withTursoFetch` composed provider）を定義
- 実装ファイル5つで `fetch` 直接呼び出しを `getFetch()` に置き換え
- 公開関数4つを `withTursoFetch` provider でラップ（`getDatabase` は内部関数のためラップ不要）
- テスト4つで `globalThis.fetch` 差し替えを `mockContext(withFetch, () => mockFetch)` に置き換え
- 409 テストは fetch モック連鎖（`mockResolvedValueOnce`）で統一。fetch 応答パターンは mock ファイルに整理する
- authentication パッケージの3層構造パターンを踏襲

### 関連ADR

- `docs/architecture-decision-record/013-authentication-testing-strategy.md`（Amendment 2026-03-11 で diva 導入承認済み）

## タスクツリー

凡例:
- `[?]` 未展開（さらに分解が必要）
- `[ ]` 葉タスク（TDDで着手可能）
- `[x]` 完了

依存関係: 上から順に実装する。同じ階層内で依存がない場合は並行実装可能。

### 1. diva 基盤セットアップ

- [ ] 1.1. 依存追加と fetch context 定義
  - 説明: `@praha/diva` を `packages/turso` に追加し、`helpers/fetch-context.ts` に `getFetch` resolver、`withFetch` provider、`withTursoFetch` composed provider を定義する
  - 完了条件:
    - 型: `getFetch` が `typeof fetch` を返す resolver として型が通ること
    - 型: `withTursoFetch` が `withFetch(() => globalThis.fetch)` として型が通ること

### 2. 実装ファイルの移行

依存関係: 2.1 を先に実装する（get-database は内部関数で、create-database と密結合しているため、テストも一体で移行する）。2.2〜2.4 は独立で並行可能。

- [ ] 2.1. create-database + get-database の移行
  - 説明: `create-database.ts` と `get-database.ts` で `fetch` を `getFetch()` に置き換え、`createDatabase` を `withTursoFetch` でラップする（`getDatabase` は内部関数のためラップ不要）。テストで `globalThis.fetch` 差し替えを `mockContext` に置き換え、409 テストは `vi.spyOn(getDatabase)` を廃止して fetch モック連鎖（`mockResolvedValueOnce`）に統一する
  - 完了条件:
    - テスト: 正常系（201）で DB 情報が返されること
    - テスト: 409 Conflict で getDatabase 経由で既存 DB 情報が返されること（fetch 連鎖で検証）
    - テスト: 409 後に getDatabase が失敗した場合のエラーハンドリング
    - テスト: 409 後に getDatabase で DB が見つからない場合のエラーハンドリング
    - テスト: 500 エラー、ネットワークエラーが適切にハンドリングされること
    - 型: export 関数の型シグネチャが変わらないこと

- [ ] 2.2. issue-token の移行
  - 説明: `issue-token.ts` で `fetch` を `getFetch()` に置き換え、`issueToken` を `withTursoFetch` でラップする。テストで `globalThis.fetch` 差し替えを `mockContext` に置き換える
  - 完了条件:
    - テスト: 有効期限付きトークン発行が正常に動作すること
    - テスト: 無期限トークン発行が正常に動作すること
    - テスト: 500 エラー、ネットワークエラーが適切にハンドリングされること
    - 型: export 関数の型シグネチャが変わらないこと

- [ ] 2.3. delete-database の移行
  - 説明: `delete-database.ts` で `fetch` を `getFetch()` に置き換え、`deleteDatabase` を `withTursoFetch` でラップする。テストで `globalThis.fetch` 差し替えを `mockContext` に置き換える
  - 完了条件:
    - テスト: 正常系（200）で成功が返されること
    - テスト: 404 エラーで DatabaseNotFoundError が返されること
    - テスト: 500 エラー、ネットワークエラーが適切にハンドリングされること
    - 型: export 関数の型シグネチャが変わらないこと

- [ ] 2.4. list-databases の移行
  - 説明: `list-databases.ts` で `fetch` を `getFetch()` に置き換え、`listDatabases` を `withTursoFetch` でラップする。テストで `globalThis.fetch` 差し替えを `mockContext` に置き換える
  - 完了条件:
    - テスト: 複数 DB の一覧が返されること
    - テスト: 空の一覧が返されること
    - テスト: 500 エラー、ネットワークエラー、不正レスポンスが適切にハンドリングされること
    - 型: export 関数の型シグネチャが変わらないこと

### 3. 最終検証

- [ ] 3.1. 静的検証
  - 説明: `pnpm type-check && pnpm lint && pnpm test` を実行し、すべてパスすることを確認する
  - 完了条件:
    - 確認: 上記コマンドがエラーなく完了すること

## 議論ログ
