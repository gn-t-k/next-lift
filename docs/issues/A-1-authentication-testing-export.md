# A-1: authentication — ./testingエクスポート未整備

**パッケージ**: @next-lift/authentication
**優先度**: 中

## 問題

`testing/`ディレクトリにfactoriesとsetup.tsがあるが、`testing/index.ts`（外部向け再エクスポート）がなく、package.jsonのexportsにも`"./testing"`がない。turso, per-user-databaseとのパターン不整合。

## 修正内容

testing/index.tsを作成しfactoriesを再エクスポート。package.jsonのexportsに`"./testing"`を追加。

## 対象ファイル

- `packages/authentication/src/testing/index.ts` 新規作成
- `packages/authentication/package.json`

## 検証方法

- `pnpm --filter @next-lift/authentication type-check` が通ること
- `@next-lift/authentication/testing`からfactoriesがインポートできること
