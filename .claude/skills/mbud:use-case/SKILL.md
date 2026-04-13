---
name: mbud:use-case
description: モデルベースUIデザインのフェーズ1（ユースケース定義）を単独で実行するスキル。ペルソナモデルと行動シナリオからユースケース一覧を作成する。「ユースケースを定義したい」「ユースケースを追加したい」で使用。
disable-model-invocation: true
allowed-tools: Read, Write, Edit, Glob, Grep, Agent
---

# フェーズ1: ユースケース定義

ペルソナモデルと行動シナリオを入力として、ユーザーの「用途」をユースケース一覧として定義する。以降すべての設計の根拠（共通言語）を確立するフェーズ。

## 前提条件

- ペルソナモデルが用意されていること
- 行動シナリオが用意されていること

## 実行方法

このスキルはサブエージェントに作業を委譲する。

1. **出力ファイルの確認**: 出力ファイルのパスをユーザーに確認する。存在しなければ `${CLAUDE_SKILL_DIR}/../mbud/references/output-template.md` を基に新規作成する
2. **サブエージェント起動**: general-purposeエージェントに以下のファイルを読ませて実行させる
   - `${CLAUDE_SKILL_DIR}/../mbud/references/general-rules.md`
   - `${CLAUDE_SKILL_DIR}/../mbud/references/phase1-use-case-definition.md`
   - 出力ファイル
3. **結果のレビュー**: サブエージェントの結果をユーザーに提示し、フィードバックを得る
4. 修正が必要な場合はサブエージェントを再起動する

## 途中から再開する場合

`${CLAUDE_SKILL_DIR}/../mbud/references/context-clear-recovery.md` を参照する。
