# ADR-017: Monorepo環境でのTurbopack依存関係解決戦略

## ステータス

承認済み

## 日付

2025-01-13

## コンテキスト

Next.js 16のTurbopackをpnpm Monorepo環境で使用する際、子依存関係（transitive dependencies）の解決に問題が発生しました。

### 発生した問題

1. **@libsql/client解決エラー**
   - `packages/authentication`が`@libsql/client`に依存
   - `apps/web`が`packages/authentication`に依存
   - 実行時に「could not resolve @libsql/client」エラーが発生

2. **ビルド時にエラーが出ない**
   - Turbopackは実行時にモジュールを解決するため、ビルド時には検出されない
   - 開発者体験を悪化させる

### 根本原因

**Next.js Issue #68805**: Turbopack + pnpm + Monorepoの既知の互換性問題

pnpmはフラットな`node_modules`構造ではなく、シンボリックリンクを使用した厳格な依存関係管理を行います。Turbopackがpnpmのネストされた構造を正しく辿れない場合があります。

## 決定

### 戦略: 各アプリケーションパッケージに直接依存関係をインストール

Workspace内の共有パッケージが持つ依存関係のうち、実行時に必要なものは各アプリケーションパッケージにも直接インストールする。

## 代替案

### A. Turbopackを使用しない（webpack使用）

- メリット: pnpm互換性の問題を回避
- デメリット: Turbopackの高速なHMRやビルド速度を失う
- 却下理由: Next.js 16ではTurbopackがデフォルトであり、将来性を考慮

### B. npm/yarnに移行

- メリット: フラットな`node_modules`構造でTurbopackが動作しやすい
- デメリット: pnpmのディスク効率やインストール速度の利点を失う
- 却下理由: プロジェクト全体でpnpmを使用しており、移行コストが高い

### C. すべての依存関係をルートにhoistする（shamefully-hoist）

- メリット: すべてのパッケージがフラットに配置されるため、Turbopackが見つけやすい
- デメリット: pnpmの厳格な依存関係管理の利点を失う（Phantom dependencies問題）
- 却下理由: 依存関係の透明性を犠牲にしたくない

## 影響

### メリット

1. **Turbopackの利点を維持**: 高速なHMRとビルド速度
2. **pnpmの利点を維持**: ディスク効率、インストール速度、厳格な依存関係管理
3. **明示的な依存関係**: 各アプリが実際に使用する依存関係が`package.json`に明記される

### デメリット

1. **依存関係の重複記述**: Workspace共有パッケージと各アプリで依存関係を二重管理
2. **バージョン不整合のリスク**: 手動で同期する必要がある
3. **メンテナンスコスト**: 依存関係更新時に複数箇所を更新

### 緩和策

- Renovateによる自動依存関係更新でバージョン不整合を防ぐ
- CIでバージョン整合性チェックを実施（将来的に検討）

## 参考

- [Next.js Issue #68805](https://github.com/vercel/next.js/issues/68805) - Turbopack + pnpm + Monorepo互換性問題
- [Better Auth Documentation - Monorepo Setup](https://www.better-auth.com/docs/installation#monorepo) - Better AuthがMonorepo環境で各アプリに依存関係を直接インストールすることを推奨
- [pnpm Documentation - Dependency Resolution](https://pnpm.io/npmrc#shamefully-hoist) - pnpmの依存関係解決戦略

## 関連するADR

- [ADR-009: pnpm Monorepo構成](./009-pnpm-monorepo.md) - Monorepo全体の設計決定
