# TDD実装: per-user-database テストセットアップ統合

## ステータス

- 状態: 完了
- 最終更新: 2026-03-30

## ToDoリスト

### 1. `mockPrivateEnv` を `database-context.mock.ts` に移動

- ステータス: `done`
- 説明: `setup.ts` の `mockPrivateEnv({ APP_ENV: "development-test" })` を `src/helpers/database-context.mock.ts` に移す
- 完了条件: 型チェック通過
- メモ:

### 2. `setup.ts` を削除

- ステータス: `done`
- 説明: `setup.ts` を削除し、`vitest.config.ts` から `setupFiles` を除去
- 完了条件: `pnpm test --filter=@next-lift/per-user-database` と `pnpm type-check` がパス
- メモ: breakdownで想定外の影響あり。setup.tsがグローバルに適用していたmockPrivateEnvが、create-turso-per-user-database.testに届かなくなった。テストファイルに直接mockPrivateEnvを追加して対処

### 3. CLAUDE.md の更新

- ステータス: `done`
- 説明: テスト環境セクションから `vi.hoisted()` の記述を削除し、現在の構成に合わせる
- 完了条件: ドキュメントが実装と一致
- メモ:

## 全体メモ

