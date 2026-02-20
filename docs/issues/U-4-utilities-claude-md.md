# U-4: utilities — CLAUDE.mdがない

**パッケージ**: @next-lift/utilities
**優先度**: 低

## 問題

各ユーティリティの用途・使い分けがドキュメント化されていない。

## 修正内容

以下を記載したCLAUDE.mdを新規作成:

- createLazyProxy: 遅延初期化（Better Auth等のモジュールスコープ外での初期化に使用）
- generateId: ID生成仕様（12文字、0-9a-z）
- withRetry + exponentialBackoff: リトライ戦略

## 対象ファイル

- `packages/utilities/CLAUDE.md` 新規作成

## 検証方法

- コードレビュー。ファイルが存在し、各ユーティリティの説明が記載されていること
