# U-2: utilities — generateIdのテストがない

**パッケージ**: @next-lift/utilities
**優先度**: 中

## 問題

`generateId`（nanoidラッパー）にテストがない。ID長12文字・使用文字種(0-9a-z)の仕様がテストで担保されていない。

## 修正内容

テストファイルを新規作成し、以下をアサート:

- ID長が12文字であること
- 使用文字種が0-9a-zのみであること
- 複数回呼び出しで異なるIDが生成されること

## 対象ファイル

- `packages/utilities/src/generate-id.test.ts` 新規作成

## 検証方法

- `pnpm --filter @next-lift/utilities test` でgenerateIdのテストが通ること
