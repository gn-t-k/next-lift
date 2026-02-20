# U-3: utilities — createLazyProxyのテストがない

**パッケージ**: @next-lift/utilities
**優先度**: 中

## 問題

`createLazyProxy`にテストがない。初回アクセスで初期化・キャッシュ動作の仕様がテストで担保されていない。

## 修正内容

テストファイルを新規作成し、以下を検証:

- 初回プロパティアクセスで初期化関数が呼ばれること
- 2回目以降はキャッシュされ、初期化関数が再度呼ばれないこと
- プロパティアクセスしない限り初期化関数が呼ばれないこと

## 対象ファイル

- `packages/utilities/src/create-lazy-proxy.test.ts` 新規作成

## 検証方法

- `pnpm --filter @next-lift/utilities test` でcreateLazyProxyのテストが通ること
