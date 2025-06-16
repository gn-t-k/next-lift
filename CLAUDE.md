# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 知識管理システム

プロジェクトの知識は以下のファイルに体系的に整理されています：

### .claude/ ディレクトリ構造

- **[.claude/context.md](.claude/context.md)**: プロジェクト背景、技術スタック、制約・注意点
- **[.claude/project-knowledge.md](.claude/project-knowledge.md)**: アーキテクチャ決定事項、実装パターン、学習・知見
- **[.claude/project-improvements.md](.claude/project-improvements.md)**: デバッグ履歴、パフォーマンス改善、問題解決の試行錯誤
- **[.claude/common-patterns.md](.claude/common-patterns.md)**: よく使うコマンドパターン、テンプレート、実装例
- **`.claude/debug/`**: デバッグ情報管理
  - `sessions/`: セッション別の一時ログ
  - `temp-logs/`: 作業中の一時ファイル
  - `archive/`: 解決済み問題のアーカイブ

### プロジェクト概要

**プロジェクトの詳細概要・機能・開発ステータスは [README.md](./README.md) を参照してください。**

Next Liftは、ウェイトトレーニングの計画と記録を行うアプリケーションです。技術的な詳細については上記の`.claude/`ディレクトリ内のファイルを参照してください。

## Claudeへの指示

### ドキュメント更新対象

ユーザーが以下について言及した場合、該当する`.claude/`ファイルを更新する：

- **プロジェクト背景・技術スタック・制約** → `.claude/context.md`を更新
- **アーキテクチャ決定・実装パターン・開発方針** → `.claude/project-knowledge.md`を更新
- **デバッグ・問題解決・改善** → `.claude/project-improvements.md`を更新
- **コマンドパターン・テンプレート** → `.claude/common-patterns.md`を更新
- **アプリの仕様・機能・ステータス** → `README.md`を更新

### 継続性とドキュメント管理

- **継続性の確認**: 今回だけでなく今後も同様の指示があった場合、該当する`.claude/`ファイルへの追記を確認する
- **定期的セルフレビュー**: 重要な決定後は該当ドキュメントを自動的にレビュー・更新する
