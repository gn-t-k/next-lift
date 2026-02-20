# RC-1: react-components — deprecated関数の残存

**パッケージ**: @next-lift/react-components
**優先度**: 低

## 問題

`composeTailwindRenderProps`が`@deprecated`のまま残存。Intent UI upstreamでは既に削除済み。プロジェクト内の参照も0件。

## 修正内容

`composeTailwindRenderProps`関数とそのJSDocを`primitive.ts`から削除。

## 対象ファイル

- `packages/react-components/src/lib/primitive.ts`

## 検証方法

- `pnpm --filter @next-lift/react-components type-check && pnpm --filter @next-lift/react-components lint` が通ること
- grepで`composeTailwindRenderProps`が0件になること
