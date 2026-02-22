# packages/tailwind-config

Monorepo全体で共有するTailwind CSS設定を一元管理するパッケージ。テーマ定義のSingle Source of Truthとして機能する。

## 機能

| 提供機能 | 説明 |
| --- | --- |
| 共通Tailwind設定 | `@next-lift/tailwind-config/tailwind.css` をCSSでimport。JSエクスポートなし |

## 使い方

### 依存関係の追加

```json
{
  "dependencies": {
    "@next-lift/tailwind-config": "workspace:*"
  },
  "devDependencies": {
    "tailwindcss": "4.1.18",
    "tailwindcss-react-aria-components": "2.0.1",
    "tw-animate-css": "1.4.0"
  }
}
```

### CSSファイルでのインポート

```css
@import "@next-lift/tailwind-config/tailwind.css";

@source "../../**/*.{js,ts,jsx,tsx}";
```

- `@import` でtailwind-configパッケージを読み込み
- `@source` でTailwindがスキャンすべきファイルパスを利用側で個別に指定

### ユーティリティクラスの使用

`@theme inline` ブロックで `--color-*` 形式にマッピングされているため、Tailwindのユーティリティクラスとして使用可能:

```html
<button class="bg-primary text-primary-fg">Button</button>
<div class="text-muted-fg border-border">...</div>
```

## 開発ガイド

### tailwind.cssの構成要素

| セクション | 内容 |
| --- | --- |
| `@import "tailwindcss"` | Tailwind本体の読み込み |
| `@import "tw-animate-css"` | アニメーションプラグイン |
| `@plugin "tailwindcss-react-aria-components"` | React Ariaの状態バリアント（`data-*`属性）をTailwindクラスとして使用可能にする |
| `@custom-variant dark` | ダークモードバリアント（`.dark`クラスベース） |
| `:root { ... }` | ライトモードのCSS変数定義 |
| `.dark { ... }` | ダークモードのCSS変数定義 |
| `@theme inline { ... }` | CSS変数をTailwindのユーティリティクラスにマッピング |
| `@layer base { ... }` | ベーススタイル（スクロールバー、フォントスムージング等） |
| `@utility touch-target` | タッチターゲット拡大用カスタムユーティリティ（最小44x44px） |

### CSS変数の体系

すべてのカラーはOKLch色空間で定義。各カラーは `-fg`（前景色）とペアで定義:

| トークン | 用途 |
| --- | --- |
| `--bg` / `--fg` | ページの背景色・前景色 |
| `--primary` / `--primary-fg` | プライマリカラー（ボタン等） |
| `--secondary` / `--secondary-fg` | セカンダリカラー |
| `--muted` / `--muted-fg` | 控えめな表現（無効状態等） |
| `--danger` / `--danger-fg` | エラー・危険状態 |
| `--border` / `--input` / `--ring` | ボーダー・入力フィールド・フォーカスリング |

角丸は `--radius-lg` を基準に比率で各サイズを算出（`--radius-xs` 〜 `--radius-4xl`）。

### ダークモード

- **切り替え方式**: `.dark`クラスベース（`@custom-variant dark (&:is(.dark *))`）
- **OS設定連動**: `@media (prefers-color-scheme: dark)` で背景色・前景色のみ切り替え

### 主要な設計判断

- **CSSパッケージとして公開**: JavaScriptのエクスポートは持たず、`package.json`の`style`フィールドのみで配布
- **OKLch色空間の採用**: 知覚的に均一な配色を実現するため、Intent UIの方針に従いOKLch色空間でカラーを定義

## 制約と注意事項

- **Web専用**: React Native/iOSでは利用不可。iOSアプリ対応時にデザイントークンパッケージへの移行を検討
- **将来のデザイントークン化**: iOSアプリ実装時に`packages/design-tokens`を新設し、プラットフォーム非依存のトークン定義に段階的に移行可能
- `packages/react-components` は本パッケージの設定を `@import` して使用する
- 現在の利用箇所: `apps/web/src/app/globals.css`, `packages/react-components/src/globals.css`
- 関連ADR: [ADR-014](../../docs/architecture-decision-record/014-intent-ui.md), [ADR-015](../../docs/architecture-decision-record/015-tailwind-css-v4.md), [ADR-016](../../docs/architecture-decision-record/016-tailwind-config-package.md)
