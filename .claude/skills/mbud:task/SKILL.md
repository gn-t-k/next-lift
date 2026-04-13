---
name: mbud:task
description: モデルベースUIデザインのフェーズ2（タスク整理）を単独で実行するスキル。ユースケース一覧からタスク表を作成する。フェーズ1が完了していることが前提。「タスクを整理したい」「タスク表を作りたい」で使用。
disable-model-invocation: true
allowed-tools: Read, Write, Edit, Glob, Grep, Agent
---

# フェーズ2: タスク整理

ユースケース一覧を入力として、ユーザーのアクションとシステムの働きを対応させ、CRUD分類でUI設計の材料となるタスク表を作成する。

## 前提条件

- フェーズ1（ユースケース定義）が完了していること
- 出力ファイルにユースケース一覧が記録されていること

## 実行方法

このスキルはサブエージェントに作業を委譲する。

1. **出力ファイルの確認**: 出力ファイルのパスをユーザーに確認する。存在しなければ `${CLAUDE_SKILL_DIR}/../mbud/references/output-template.md` を基に新規作成する
2. **サブエージェント起動**: general-purposeエージェントに以下のファイルを読ませて実行させる
   - `${CLAUDE_SKILL_DIR}/../mbud/references/general-rules.md`
   - `${CLAUDE_SKILL_DIR}/../mbud/references/phase2-task-organization.md`
   - 出力ファイル
3. **結果のレビュー**: サブエージェントの結果をユーザーに提示し、フィードバックを得る
4. 修正が必要な場合はサブエージェントを再起動する

## 途中から再開する場合

`${CLAUDE_SKILL_DIR}/../mbud/references/context-clear-recovery.md` を参照する。
