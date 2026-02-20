# E-1: env — 未使用の依存パッケージ

**パッケージ**: @next-lift/env
**優先度**: 中

## 問題

package.jsonのdependenciesに`@next-lift/utilities`があるが、コード内で一切使用されていない。

## 修正内容

dependenciesから`@next-lift/utilities`を削除。

## 対象ファイル

- `packages/env/package.json`

## 検証方法

- `pnpm --filter @next-lift/env type-check && pnpm --filter @next-lift/env test` が通ること
