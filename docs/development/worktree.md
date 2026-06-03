# worktree 運用ガイド

`git worktree` で Claude Code セッションを並行運用する際の手順とルール。

## 前提

- worktree は使い捨て前提で作成・削除する
- 親リポジトリ（`/Users/.../next-lift`）と worktree（`.claude/worktrees/<name>/` など）は同一の `.git` を共有するが、作業ツリーは独立する
- `node_modules`、`.env`、`.env.local`、`.next/`、`.turbo/` などはディレクトリごとに独立する

## 検証コマンドが通る状態にする

`git worktree add` 直後に `pnpm install` だけ走らせた状態では `pnpm type-check` / `pnpm test` が落ちる。理由は次の3点:

1. `.env` / `.env.local` / `.env.*.local` は gitignore 対象のため worktree に持ち込まれない
2. `.vercel/` も gitignore 対象で、`vercel pull` 済みの `.env.preview.local` が無い
3. `next.config.ts` の `typedRoutes: true` が生成する `LayoutProps` / `PageProps` 型は `.next/types/**` に出力されるが、`next dev` / `next build` / `next typegen` を一度も走らせていない worktree には存在しない

`pnpm setup:worktree` で上記3つを一括整備する。

worktree 初回起動時は、`node_modules` または `apps/web/.next/types` が無いことを SessionStart hook が検知し、`pnpm setup:worktree` をバックグラウンドで自動実行する。ログは worktree 直下の `.setup-worktree.log` に出力され、末尾に `=== SETUP DONE ===` が出れば完了。`pnpm type-check` / `pnpm build` / `pnpm test` はそれを待ってから実行する。

手動で実行する場合:

```sh
# 親リポ側で一度だけ（VERCEL_TOKEN 不要、CLI ログイン済みなら通る）
npx vercel pull --yes --environment=preview

# worktree のルートで
pnpm setup:worktree
```

スクリプトの動作:

1. `pnpm install` で依存をインストール
   - hook 経由のバックグラウンド実行（TTYなし）でも `node_modules` 再作成が中断しないオプションを付ける
2. `bash .claude/scripts/copy-worktree-env.sh` で env ファイルをコピー
   - 親リポの worktree ルート配下を再帰的に走査し `.env` / `.env.local` / `.env.*.local` を抽出
   - 同じ相対パスで現在の worktree へコピー（`apps/web/.env` → `<worktree>/apps/web/.env` など）
   - 既存ファイルと内容が一致する場合はスキップ、差分があれば上書き
   - `node_modules` `.git` `.next` `.turbo` `dist` `build` `.vercel` は走査対象外
3. 親リポの `.vercel/` 全体を worktree にコピー
   - `vercel pull` を再実行する代わりに、親リポでログイン済みの結果を再利用
   - 並行作業中に親リポで `vercel pull` を再実行した場合は再度 `pnpm setup:worktree` を走らせる
   - 親リポに `.vercel/.env.preview.local` が無い場合は、このステップと次の typegen をスキップし、install と env コピーまでで終了する
4. `pnpm --filter @next-lift/web exec next typegen` で `.next/types/**` を生成
   - `APP_ENV` 未設定時は `development-worktree` をフォールバックで設定

SessionStart hook の自動実行は `node_modules` または `apps/web/.next/types` が無い未セットアップ時のみで、セットアップ済みの worktree では何もしない（既存ファイルを常時上書きはしない）。

### env だけコピーしたいとき

env だけ更新したい場合は単独で実行できる。

```sh
pnpm worktree:copy-env
```

## Turso トークン管理

worktree 並行運用で起こりやすい事故:

- 1 つの worktree のエージェントが Turso トークンを revoke / rotate した瞬間、他方の worktree が落ちる
- 古い長命トークンが手動コピーで複数 worktree に残り続ける
- 本番テナント DB を worktree から誤って叩く

### ルール

1. **長命トークンを `.env` に直書きしない**: `turso db tokens create --expiration 24h` のように短命化する
2. **本番テナントの Turso group には worktree から接続しない**: マイグレーションや本番データ操作は親リポからのみ実行
3. **トークンを rotate するときは事前に他 worktree の状況を確認する**: 並行作業中の他セッションを落とさない

短命トークンの取得例:

```sh
# 24時間で失効するトークンを取得
turso db tokens create <db-name> --expiration 24h
```

将来的に worktree ごとに専用 group / db を切り出す運用も検討対象だが、コストとのトレードオフのため現時点では採用しない。

## 関連

- #678: Storybook ポート / chrome-devtools MCP プロファイル衝突対策
- #680: worktree 並列作業の罠まとめ skill（予定）
- #823: worktree で `pnpm install` 後に検証コマンドが通らない問題（`pnpm setup:worktree` で対応）
