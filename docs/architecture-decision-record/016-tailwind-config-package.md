# ADR-016: Tailwind設定の共通化（tailwind-configパッケージ）

## ステータス

Accepted

## 関連ADR

- [ADR-015: Tailwind CSS v4の採用](./015-tailwind-css-v4.md)
- [ADR-009: pnpm + Monorepo](./009-pnpm-monorepo.md)

## コンテキスト

Next LiftのMonorepo構成において、`apps/web`と`packages/react-components`の両方でTailwind CSS設定（`globals.css`）が重複していた。この重複は以下の問題を引き起こしていた:

- **メンテナンス性の低下**: カラー、フォント、プラグイン設定などを2箇所で管理する必要がある
- **一貫性の欠如**: 一方だけ変更して他方の更新を忘れるリスク
- **Single Source of Truthの欠如**: テーマ定義の正解が複数存在する状態

## 決定内容

**`packages/tailwind-config`パッケージを作成し、Tailwind設定を共通化する。**

### パッケージ構成

```
packages/tailwind-config/
├── tailwind.css     # 共通のTailwind設定
└── package.json     # styleフィールドでtailwind.cssを指定
```

### tailwind.cssの内容

以下の要素を含む:

- `@import "tailwindcss"` - Tailwind本体
- `@import "tw-animate-css"` - アニメーションプラグイン
- `@plugin "tailwindcss-react-aria-components"` - React Ariaプラグイン
- `@custom-variant dark` - ダークモードバリアント
- `:root { ... }` - ライトモードのCSS変数定義
- `.dark { ... }` - ダークモードのCSS変数定義
- `@theme inline { ... }` - Tailwind v4のテーマ定義
- `@layer base { ... }` - ベーススタイル
- `@utility touch-target { ... }` - カスタムユーティリティ

### 利用側の設定

`apps/web`と`packages/react-components`のそれぞれの`globals.css`では:

```css
@import "@next-lift/tailwind-config/tailwind.css";

@source "../../**/*.{js,ts,jsx,tsx}";
@source "../../../../packages/react-components/src/**/*.{js,ts,jsx,tsx}";
```

- `@import`でtailwind-configパッケージを読み込み
- `@source`でTailwindがスキャンすべきファイルを指定

## 結果・影響

### メリット

- **Single Source of Truth**: テーマ定義が`packages/tailwind-config/tailwind.css`の1箇所に集約
- **メンテナンス性の向上**: カラーやフォントの変更を1箇所で管理可能
- **一貫性の保証**: apps/webとpackages/react-componentsで完全に同じテーマ設定
- **CSSパッケージの標準的な構成**: `package.json`の`style`フィールドを使用

### 将来の拡張性

**デザイントークンへの段階的な移行が可能:**

現時点ではTailwind設定のみを共通化しているが、将来的にiOSアプリ実装時には以下の構成への移行を検討する:

```
packages/
├── design-tokens/         # 新規作成（iOS実装時）
│   ├── tokens.json        # プラットフォーム非依存のトークン定義
│   ├── build.js           # 各形式への変換スクリプト
│   └── dist/
│       ├── css-variables.css    # Web用CSS変数
│       ├── tailwind.js          # Tailwind設定用
│       └── react-native.ts      # React Native用
│
├── tailwind-config/       # 既存パッケージ
│   └── tailwind.css       # design-tokensを参照し、Tailwind固有設定を追加
│                          # 例: @import "@next-lift/design-tokens/dist/css-variables.css"
│
└── react-components/
```

この構成により:
- `design-tokens`: カラー、フォント、スペーシング等のトークン定義（JSON）
- `tailwind-config`: design-tokensを参照し、Tailwind固有の設定（プラグイン、ユーティリティ等）を追加
- iOSアプリ: design-tokensから直接React Native StyleSheetを生成

**段階的な移行が可能で、`tailwind-config`のリネームは不要。**

### 制約

- **現時点ではWeb専用**: React Native/iOSでは利用不可
- **デザイントークン化は将来対応**: 現時点ではYAGNI原則に従い、過度な抽象化を避ける

## 代替案

以下の選択肢を検討した:

### デザイントークンパッケージ（現時点では採用せず）

プラットフォーム非依存のデザイントークンを定義し、CSS変数やReact Native StyleSheetに変換する方法。

- **メリット**:
  - iOS/Web間でデザインの一貫性を保証
  - プラットフォーム非依存の抽象化
  - Style DictionaryやTheo等の既存ツールを活用可能
- **却下理由**:
  - **iOSアプリがまだ存在せず、YAGNI原則に反する**
  - ビルドステップの追加による複雑性の増加
  - 過度な抽象化によるメンテナンスコストの増加
- **将来的な検討**: iOSアプリ実装開始時に再検討

### 相対パスでの直接import

`packages/theme`を作らず、相対パスで直接importする方法。

- **メリット**: シンプル、パッケージ管理不要
- **却下理由**:
  - 相対パスが複雑（`../../../../packages/theme/src/globals.css`）
  - パッケージとしての明確な境界がない
  - 依存関係が明示的でない

### apps/webにテーマを配置してpackages/react-componentsが参照

`apps/web`をテーマの定義元とし、`packages/react-components`がそれを参照する方法。

- **メリット**: 新しいパッケージ不要
- **却下理由**:
  - 依存方向が逆（パッケージがアプリに依存してはいけない）
  - Storybookが独立して動作できない

## トレードオフ

Tailwind設定の共通化（tailwind-configパッケージ）は以下のトレードオフを伴う:

- ✅ メンテナンス性、一貫性、Single Source of Truth、将来の拡張性
- ❌ パッケージ管理の複雑性の若干の増加、現時点ではWeb専用

ただし、メンテナンス性と一貫性の向上が、パッケージ管理の複雑性増加を大きく上回るため、tailwind-configパッケージが最適な選択肢である。また、将来的なデザイントークン化への段階的な移行経路も確保されている。

## 決定日

2025-11-02
