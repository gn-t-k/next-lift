---
name: mbud:review
description: モデルベースUIデザインのフェーズ6（最終レビュー）を単独で実行するスキル。全フェーズの成果物を横断的に検証し、Critical/Improvement/Noteの3段階でレビューレポートを作成する。「UI設計をレビューしたい」「最終レビューをしたい」で使用。
disable-model-invocation: true
allowed-tools: Read, Write, Edit, Glob, Grep, Agent
---

# フェーズ6: 最終レビュー

全フェーズの成果物を入力として、横断的に検証し品質を確保する。成果物間の整合性、モードレス原則、プラットフォーム適合性、拡張性の観点でレビューし、Critical/Improvement/Noteの3段階で分類したレビューレポートを作成する。

## 前提条件

- フェーズ1〜5がすべて完了していること
- 出力ファイルにユースケース一覧、タスク表、コンテンツ構造、コンセプト定義、メンタルモデル、フレーム構造、ナビゲーション構造が記録されていること

## 実行方法

このスキルはサブエージェントに作業を委譲する。

1. **出力ファイルの確認**: 出力ファイルのパスをユーザーに確認する。存在しなければ `${CLAUDE_SKILL_DIR}/../mbud/references/output-template.md` を基に新規作成する
2. **サブエージェント起動**: general-purposeエージェントに以下のファイルを読ませて実行させる
   - `${CLAUDE_SKILL_DIR}/../mbud/references/general-rules.md`
   - `${CLAUDE_SKILL_DIR}/../mbud/references/phase6-final-review.md`
   - 出力ファイル
3. **結果のレビュー**: サブエージェントの結果をユーザーに提示し、フィードバックを得る
4. 修正が必要な場合はサブエージェントを再起動する

## 途中から再開する場合

`${CLAUDE_SKILL_DIR}/../mbud/references/context-clear-recovery.md` を参照する。
