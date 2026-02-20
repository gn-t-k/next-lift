# U-1: utilities — デフォルトエクスポートの重複

**パッケージ**: @next-lift/utilities
**優先度**: 中

## 問題

`"."`エクスポートが`create-lazy-proxy`と重複。`"."`は利用箇所なし（確認済み: 全4箇所が名前付きパスを使用）。

利用箇所:

- `apps/web/src/libs/auth.ts` → `@next-lift/utilities/create-lazy-proxy`
- `apps/web/src/app/api/auth/[...all]/route.ts` → `@next-lift/utilities/create-lazy-proxy`
- `apps/ios/src/lib/database-context.tsx` → `@next-lift/utilities/with-retry`
- `packages/authentication/.../save-user-database-credentials.ts` → `@next-lift/utilities/generate-id`

## 修正内容

exportsから`"."`エントリを削除。

## 対象ファイル

- `packages/utilities/package.json`

## 検証方法

- `pnpm --filter @next-lift/utilities type-check` が通ること
- grepで`from "@next-lift/utilities"`（サブパスなし）が0件であること
