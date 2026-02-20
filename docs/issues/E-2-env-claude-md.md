# E-2: env — CLAUDE.mdがない

**パッケージ**: @next-lift/env
**優先度**: 低

## 問題

他の主要パッケージ（turso, authentication, per-user-database, react-components）にはCLAUDE.mdがあるが、envにはない。

## 修正内容

以下を記載したCLAUDE.mdを新規作成:

- エクスポート構成（./private, ./public, ./testing）
- static/dynamic分離の設計理由（Next.js SSGへの対応）
- Proxy制限（Object.keys不可）
- テスト環境（createMockEnvの使い方）

## 対象ファイル

- `packages/env/CLAUDE.md` 新規作成

## 検証方法

- コードレビュー。ファイルが存在し、上記項目が記載されていること
