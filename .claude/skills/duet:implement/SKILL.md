---
name: duet:implement
description: GitHub Issue への実装を codex と claude の 2 モデルで分担するワークフロー。実装は codex に TDD で行わせ、claude がレビューし、要修正なら codex に差し戻す。複数モデルの協働で実装品質を上げつつトークン消費を分散する。`/duet:implement #123` のように issue 番号を渡して明示的に呼び出す。
---

# duet:implement - codex 実装 + claude レビューの協働ワークフロー

GitHub Issue への対応を、実装は `codex:rescue`、レビューは claude が担当する形で進める。
複数モデルが役割を分けて協働することで、実装品質を上げつつトークン消費を分散する。

## 前提

- ローカルで codex CLI（`codex:rescue` スキル）が利用可能であることを前提とする
- issue 番号は呼び出し時の引数で受け取る（例: `/duet:implement #123`）
- 引数がなければ、対応する issue 番号をユーザーに尋ねてから始める

## 実行手順

### 1. issue の内容を取得

```bash
gh issue view <番号> --json number,title,body,labels,comments
```

取得した内容を読み、対応範囲を把握する。不明点があればこの時点でユーザーに確認する。

### 2. codex に TDD で実装を依頼

`codex:rescue` スキルを呼び出し、以下を依頼する:

- 「issue #<番号> を `/tdd` で実装してほしい」
- issue のタイトル・本文・関連コメントの要点を渡す
- このリポジトリの検証コマンド（`pnpm type-check` / `pnpm lint` / `pnpm test`）を通すところまで含める

codex の実装が完了するまで待つ。

### 3. claude がレビュー

codex の実装完了後、claude が **自分で diff を読んでレビューする**（追加のレビュースキルは使わない）。

```bash
git diff
git status
```

レビュー観点:

- issue の要件を満たしているか
- `.claude/rules/` の各ルール（coding-style / testing / database / product-design）に沿っているか

問題がなければ手順 5 へ。要修正なら手順 4 へ。

### 4. 要修正なら codex に差し戻す（最大 2 回まで）

レビューで見つかった問題を具体的に整理し、再び `codex:rescue` スキルに修正を依頼する。
修正完了後、手順 3 に戻って再レビューする。

**このループは最大 2 回まで。** 2 回の差し戻し後もレビューを通らない場合は、ループを止めて
残っている問題と原因を整理してユーザーに報告し、人間の判断を仰ぐ。

### 5. 検証コマンドを通して完了報告

レビューを通過したら、検証コマンドを実行して結果を確認する:

```bash
pnpm type-check
pnpm lint
pnpm test
```

すべて通ったら、以下を報告して終了する:

- 対応した issue 番号とタイトル
- 実装内容の要点
- 何回差し戻したか（差し戻しがあった場合）
- 検証コマンドの結果

コミット・PR 作成はこのスキルの責務外。必要ならユーザーが別途 `/tidy-history` 等で行う。

## 注意

- 実装は codex、レビューは claude という役割分担を崩さない（claude が自分で実装し始めない）
- レビューは妥協しない。プロジェクトのルールに照らして、迎合せず指摘する
