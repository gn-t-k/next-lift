---
name: worktree-tips
description: worktree並列運用時に踏みやすい罠（DB / Git / node_modules / CI / AIエージェント / macOS）のチェックリスト。明示的に呼び出して使う。
---

# worktree-tips

`git worktree` で Claude Code セッションを並列運用するときに踏みやすい罠のまとめ。worktree 環境で作業を始めたときに `/worktree-tips` で参照する。

このスキルは常時コンテキストには載せず、必要なときだけ呼び出して読む前提。auto-trigger を狙わない。

## 関連 issue / ドキュメント

- [#678](https://github.com/gn-t-k/next-lift/issues/678) — Storybook ポート / chrome-devtools MCP プロファイル衝突
- [#679](https://github.com/gn-t-k/next-lift/issues/679) — `.env.local` 継承 / Turso トークン管理
- [docs/development/worktree.md](../../../docs/development/worktree.md) — worktree 運用ガイド

## 1. DB / 永続ストア

| 罠 | 詳細 | 対策 |
| --- | --- | --- |
| Turso トークン共有事故 | 1 つの worktree が `turso db tokens invalidate` を叩くと他方が全滅 | トークンは短命化（`--expiration 24h`）、本番テナントは worktree から触らない（→ #679）|
| SQLite WAL ロック | 同じ DB ファイルを別 worktree から書き込むと WAL/SHM が破損する可能性 | 各 worktree でファイル DB を分離する、または読み取り専用接続にする |
| libSQL embedded replica の競合 | 同じ embedded replica パスを複数プロセスで開くと sync 競合 | `apps/ios` 等の embedded replica は worktree ごとに別パスを設定 |

## 2. Git

| 罠 | 詳細 | 対策 |
| --- | --- | --- |
| 同一ブランチの worktree 重複 checkout | `git worktree add` は同じブランチを複数 worktree から checkout できない | 検出されたら `git worktree list` で既存の場所を確認してから別ブランチを切る |
| `git stash` のグローバル共有 | stash は `.git` 共有なので worktree 間で同じ stash list が見える | worktree 内で `git stash pop` するときは `git stash list` で他のスタッシュを誤適用しないか確認 |
| submodule | submodule の `.git` 参照は親リポと共有。worktree 側で submodule を更新すると他方にも波及 | このプロジェクトは submodule 未使用なので影響なし（採用時に再評価） |
| Git LFS のディスク N+1 倍 | LFS オブジェクトは `.git/lfs` 共有だが checkout 後の作業ファイルは worktree ごとに重複 | このプロジェクトは LFS 未使用 |

このプロジェクトは Git hooks (husky/lefthook/pre-commit) を使用していないため、フック衝突は考慮不要。

## 3. node_modules / ビルドキャッシュ

| 罠 | 詳細 | 対策 |
| --- | --- | --- |
| pnpm の peer 依存歪み | worktree ごとに `pnpm install` し直さないと lockfile 変更が反映されない | `pnpm setup:worktree`（未セットアップなら SessionStart hook が自動実行）で install まで整備 |
| Vite 依存プリバンドル | `node_modules/.vite` のキャッシュが古い lockfile に紐づく | 依存変更後は `rm -rf node_modules/.vite` |
| `.next/cache` `.turbo` の肥大化 | worktree ごとに別キャッシュが作られ、ディスクが N 倍消費 | 不要 worktree は `git worktree remove` で完全削除 |
| Turborepo のパス違いキャッシュミス | `--cache-dir` がデフォルトのままだと worktree ごとにキャッシュ独立、共有できない | 共有したい場合は `TURBO_CACHE_DIR` を絶対パスで揃える（ただし並行書き込みには注意）|

## 4. CI / lint

| 罠 | 詳細 | 対策 |
| --- | --- | --- |
| Biome / ESLint キャッシュ衝突 | キャッシュファイルが worktree 間で意図せず共有されると古い結果を返す | プロジェクトデフォルトで各 worktree 配下にキャッシュを置く構成のため通常は問題ない |
| GitHub Actions concurrency group | 同一 PR で並行 push すると後発が先発をキャンセル、worktree から複数 push 流すと事故りやすい | concurrency group 設定を理解した上で push する。複数 worktree から同一 PR を更新しない |

このプロジェクトは husky / lefthook / pre-commit を使用していないため、ローカルフック衝突は考慮不要。

## 5. AI エージェント固有

| 罠 | 詳細 | 対策 |
| --- | --- | --- |
| 同一ファイル並行編集の後勝ち | 親と worktree が同じ論理ファイルを編集しても、worktree 間ではファイル分離。ただし同じブランチを別場所で進めていると merge 時に衝突 | worktree ごとに別ブランチを切る前提で運用 |
| `.env.local` 未コピー | `git worktree add` は gitignored ファイルを持ち込まない | `pnpm setup:worktree` で install + env + `.vercel` + `next typegen` を一括整備（→ #823） |
| `.next/types` 未生成で type-check 失敗 | `next.config.ts` の `typedRoutes: true` が出す `LayoutProps` / `PageProps` 型は `next dev` / `build` / `typegen` を一度走らせないと存在しない。`pnpm install` 直後の worktree で `pnpm type-check` が `TS2304` で落ちる | `pnpm setup:worktree` の `next typegen` ステップで生成（→ #823） |
| `.vercel/.env.preview.local` 未取得で test / build 失敗 | `vercel pull` の結果が無いと `BETTER_AUTH_SECRET` 等の env 検証で落ちる。`copy-worktree-env.sh` は `.vercel` を走査対象外にしているため別途コピーが必要 | 親リポで `npx vercel pull --yes --environment=preview` 済みなら `pnpm setup:worktree` が `.vercel/` 全体をコピー（→ #823） |
| stacked PR の base rebase 連鎖崩壊 | 3〜4 段以上に積むと base rebase で全段の force-push が必要になり破綻 | 実用上限は 3〜4 段。それ以上は親 PR を先にマージしてから次段を立てる |
| 認証トークン共有 | `.env` に焼き付いたトークンが複数 worktree で共有されると revoke 連鎖が起きる | 短命トークン（→ #679）、または worktree ごとに分離した token を発行 |
| Storybook / Chrome DevTools MCP の固定リソース取り合い | localhost:6006 や Chrome user-data-dir が衝突 | `STORYBOOK_PORT` で port を分ける、chrome-devtools は `--isolated=true`（→ #678）|

## 6. macOS

| 罠 | 詳細 | 対策 |
| --- | --- | --- |
| `ulimit -n` 不足で EMFILE | worktree 数 × node_modules 数 × ファイルウォッチで file descriptor を食い尽くす | `ulimit -n 10240` などで上限を上げる、または不要 worktree を削除 |
| APFS clone (`cp -c`) でディスク節約 | macOS の APFS は `cp -c` で copy-on-write が効く。`node_modules` を初期化するときに使うと早い | `cp -c -R node_modules <worktree>/` で初期化を高速化（変更されない部分はゼロコピー） |
| VS Code / Cursor の二重 index | 親リポと worktree を同時に開くとそれぞれが TS Server を立ち上げて重い | 片方を閉じる、または `files.watcherExclude` を活用 |
| Spotlight / Time Machine の自動 index | `node_modules` や `.next/cache` が大量にあると Spotlight が CPU を食う | `~/Library/Preferences/com.apple.spotlight.plist` または `mdutil -i off <path>` で除外 |

## 補足

- 直接の実害はないため低優先度のチェックリスト。worktree 並列運用が増えるほど効く性質
- 各項目の出典は本スキル作成時の調査ログ（Storybook / Chrome MCP / DB / Git / node_modules / CI / AI エージェント / macOS の 8 軸）
