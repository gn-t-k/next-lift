---
name: mbud:concept-frame
description: モデルベースUIデザインのフェーズ4（コンセプト定義・フレーム構造設計）を単独で実行するスキル。ユースケース・タスク・コンテンツ構造からコンセプト定義、メンタルモデル、フレーム構造を設計する。「コンセプトを定義したい」「フレーム構造を設計したい」で使用。
disable-model-invocation: true
allowed-tools: Read, Write, Edit, Glob, Grep, Agent
---

# フェーズ4: コンセプト定義・フレーム構造設計

ユースケース一覧、タスク表、コンテンツ構造を入力として、デザインの「芯」（コンセプト）を定め、ユーザーのメンタルモデルを整理し、UIの「外枠」（フレーム構造）を設計する。

## 前提条件

- フェーズ1（ユースケース定義）が完了していること
- フェーズ2（タスク整理）が完了していること
- フェーズ3（コンテンツ構造設計）が完了していること
- 出力ファイルにユースケース一覧、タスク表、コンテンツ構造が記録されていること

## 実行方法

このスキルはサブエージェントに作業を委譲する。

1. **出力ファイルの確認**: 出力ファイルのパスをユーザーに確認する。存在しなければ `${CLAUDE_SKILL_DIR}/../mbud/references/output-template.md` を基に新規作成する
2. **サブエージェント起動**: general-purposeエージェントに以下のファイルを読ませて実行させる
   - `${CLAUDE_SKILL_DIR}/../mbud/references/general-rules.md`
   - `${CLAUDE_SKILL_DIR}/../mbud/references/phase4-concept-frame.md`
   - 出力ファイル
3. **結果のレビュー**: サブエージェントの結果をユーザーに提示し、フィードバックを得る
4. 修正が必要な場合はサブエージェントを再起動する

## 途中から再開する場合

`${CLAUDE_SKILL_DIR}/../mbud/references/context-clear-recovery.md` を参照する。
