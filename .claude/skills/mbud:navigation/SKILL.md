---
name: mbud:navigation
description: モデルベースUIデザインのフェーズ5（ナビゲーション構造設計）を単独で実行するスキル。コンテンツ構造の多重度、フレーム構造、ユースケース一覧、コンセプト定義からナビゲーション構造図（Mermaid flowchart）を作成する。「ナビゲーションを設計したい」「画面遷移を設計したい」で使用。
disable-model-invocation: true
allowed-tools: Read, Write, Edit, Glob, Grep, Agent
---

# フェーズ5: ナビゲーション構造設計

コンテンツ構造（多重度）、フレーム構造、ユースケース一覧、コンセプト定義を入力として、ユーザーを目的のコンテンツまで導く経路を設計する。ボトムアップ式とトップダウン式の二方向から設計し、「挟み込み戦術」で統合する。

## 前提条件

- フェーズ1（ユースケース定義）が完了していること
- フェーズ3（コンテンツ構造設計）が完了していること（特に多重度）
- フェーズ4（コンセプト定義・フレーム構造設計）が完了していること
- 出力ファイルにコンテンツ構造、フレーム構造、ユースケース一覧、コンセプト定義が記録されていること

## 実行方法

このスキルはサブエージェントに作業を委譲する。

1. **出力ファイルの確認**: 出力ファイルのパスをユーザーに確認する。存在しなければ `${CLAUDE_SKILL_DIR}/../mbud/references/output-template.md` を基に新規作成する
2. **サブエージェント起動**: general-purposeエージェントに以下のファイルを読ませて実行させる
   - `${CLAUDE_SKILL_DIR}/../mbud/references/general-rules.md`
   - `${CLAUDE_SKILL_DIR}/../mbud/references/phase5-navigation-structure.md`
   - 出力ファイル
3. **結果のレビュー**: サブエージェントの結果をユーザーに提示し、フィードバックを得る
4. 修正が必要な場合はサブエージェントを再起動する

## 途中から再開する場合

`${CLAUDE_SKILL_DIR}/../mbud/references/context-clear-recovery.md` を参照する。
