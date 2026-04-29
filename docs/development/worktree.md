# worktree 運用ガイド

`git worktree` で Claude Code セッションを並行運用する際の手順とルール。

## 前提

- worktree は使い捨て前提で作成・削除する
- 親リポジトリ（`/Users/.../next-lift`）と worktree（`.claude/worktrees/<name>/` など）は同一の `.git` を共有するが、作業ツリーは独立する
- `node_modules`、`.env`、`.env.local`、`.next/`、`.turbo/` などはディレクトリごとに独立する

## env ファイルの引き継ぎ

`.env` / `.env.local` / `.env.*.local` は gitignore 対象のため `git worktree add` では持ち込まれない。worktree 作成直後に親リポからコピーする。

```sh
# worktree のルートで実行
bash .claude/scripts/copy-worktree-env.sh
```

スクリプトの動作:

- 親リポの worktree ルート配下を再帰的に走査し、`.env` `.env.local` `.env.*.local` を抽出
- 同じ相対パスで現在の worktree へコピー（`apps/web/.env` → `<worktree>/apps/web/.env` など）
- 既存ファイルと内容が一致する場合はスキップ、差分があれば上書き
- `node_modules` `.git` `.next` `.turbo` `dist` `build` `.vercel` は走査対象外

セキュリティ上の理由で、コピーは worktree から手動実行する明示的な仕組みにしている（自動 SessionStart hook で常時上書きはしない）。

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
