# TC-1: tailwind-config — CLAUDE.mdがない

**パッケージ**: @next-lift/tailwind-config
**優先度**: 低

## 問題

CSS Variables一覧、テーマカスタマイズ方法、アプリ側での統合方法がドキュメント化されていない。

## 修正内容

以下を記載したCLAUDE.mdを新規作成:

- パッケージの役割（共通テーマ定義）
- CSS Variablesの構造（色、サイズ、フォント）
- ダークモード対応
- アプリ側での`@import`方法
- cn/cxとの関係（react-componentsパッケージとの連携）

## 対象ファイル

- `packages/tailwind-config/CLAUDE.md` 新規作成

## 検証方法

- コードレビュー。ファイルが存在し、上記項目が記載されていること
