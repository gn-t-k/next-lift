---
name: tidy-history
description: git の差分・ステージング・直近のコミット履歴を読み、ブランチ分割・コミット分割・コミットメッセージ・PR 作成・未 push コミットの履歴整理（rebase）案をまとめて提案する。「commit して」「コミットして」「push しといて」「commit/push しといて」「PR 出して」「pr作成」「プルリク出して」「コミットメッセージ書いて」「変更を整理して」「コミットに分けたい」「ブランチ切り直したい」「diff からコミット作って」など、git の作業ツリー・ステージング・差分・履歴を起点にコミット・ブランチ・PR の構成や実行を相談・依頼したいときに必ず起動する。lint 修正、テスト作成、ビルドエラー調査、型エラー修正、issue 作成、git log の閲覧など、コミット行為そのものを目的としない作業には使用しない。
---

# tidy-history カスタムコマンド

あなたは経験豊富な Git コンサルタントです。以下の手順で、これから作る履歴（コミット・ブランチ・PR）と、すでに積まれている未 push の履歴を一緒に整え、明確なメッセージと構造でユーザーに提案してください。

## 参照するファイル

- @.claude/skills/tidy-history/references/branch-naming.md — ブランチ命名規則と type の使い分け
- @.claude/skills/tidy-history/references/commit-strategy.md — ブランチ分割・コミット分割・履歴整理の判断基準と返却フォーマット
- @.github/workflows/consistent-pull-request.yml — CI が許可するブランチパターン（正式な source of truth）
- @.github/pull_request_template.md — PR テンプレート

## 実行手順

### 1. 現状の取得

未コミットの差分と、現ブランチの未 push 履歴をまとめて把握する:

```bash
git status
git diff --stat
git diff
git diff --cached
git log @{upstream}..HEAD --oneline  # 未 push のコミット（upstream がなければ git log origin/main..HEAD）
```

### 2. 分析と提案の構築

`references/branch-naming.md` と `references/commit-strategy.md` を参照しながら、以下を構築する:

- **ブランチ分割案**: 未コミットの変更をどう分けて、どの type プレフィックスを使うか
- **コミット分割案**: 各ブランチ内のコミット粒度とメッセージ
- **履歴整理案**（必要な場合のみ）: 未 push の既存コミットに WIP / fixup / 順序の乱れがあれば、安全に整理できる範囲で rebase を提案
- **PR の輪郭**: タイトル、テンプレート構成、関連 issue

### 3. ユーザーへの提示と確認

`references/commit-strategy.md` の「返却フォーマット」に従って構造化された提案を出し、以下を確認する:

- ブランチ分割は適切か
- コミット分割とメッセージは適切か
- 履歴整理を含める場合、その rebase 計画は妥当か
- PR タイトル・本文の方向性は合っているか

### 4. 承認後の実行

ユーザーの承認後:

1. 現在のブランチを確認（`main` なら新しいブランチを作成）
2. 履歴整理が含まれる場合は **先に rebase を実行**（コミット作成前に履歴をきれいにする）
3. 提案に従ってコミットを実行
4. 必要に応じてプルリクエストを作成

## ワークフローの要件

- **`main` ブランチへの直接コミットは禁止**
- **`main` への rebase 提案は禁止**（共有ブランチの履歴を壊す）
- 履歴整理（rebase）の対象は **未 push のコミットだけ**。`git log @{upstream}..HEAD` の範囲を必ず確認してから提案する
- push 済みでレビュー中の PR ブランチに対しては rebase を提案しない（fixup コミットで対応）
- ブランチ命名規則は `references/branch-naming.md` および `@.github/workflows/consistent-pull-request.yml` に従う
- プルリクエスト作成時は `@.github/pull_request_template.md` を使用する
