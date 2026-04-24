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

### タイポグラフィ: テキストスケール（Major Third = 1.25倍）

見出し・本文・キャプション用のサイズ階層。`text-xs` 〜 `text-4xl` のユーティリティとして利用可能。

| トークン | サイズ | 用途（目安） |
| --- | --- | --- |
| `--text-xs` | 0.75rem | caption、補助情報 |
| `--text-sm` | 0.875rem | body（計画ビューの本文） |
| `--text-base` | 1rem | 基準サイズ |
| `--text-lg` | 1.125rem | lead |
| `--text-xl` | 1.25rem | section heading |
| `--text-2xl` | 1.563rem | 中見出し |
| `--text-3xl` | 1.953rem | ページタイトル |
| `--text-4xl` | 2.441rem | display |

### タイポグラフィ: 数値専用スケール（二重スケール）

数値表示（重量・回数・RPE・%1RM・e1RM）用の別系統スケール。`text-num-sm` 〜 `text-num-xl`。

| トークン | サイズ | 用途（目安） |
| --- | --- | --- |
| `--text-num-sm` | 0.875rem | インライン数値（本文中に埋め込む） |
| `--text-num-md` | 1.125rem | やや強調した数値 |
| `--text-num-lg` | 1.5rem | 強調数値 |
| `--text-num-xl` | 2rem | ヒーロー数値（V6 セット記録の入力など） |

通常、数値を縦に並べる場面では `tabular-nums` と併用してカラムを揃える。

### コンテキスト依存の密度トークン

Next Liftは**ジム外（計画・振り返り）**と**ジム内（記録）**の2コンテキストを前提に設計されている（`docs/project/ui-design/design-principles.md` の「コンテキスト依存の設計」）。

- **ジム外（デフォルト）**: Compact 密度。情報密度高め、小さめのラベル
- **ジム内**: Comfortable 密度。周辺テキストとスペーシングを一段ゆったり

ジム内コンテキストを宣言するには、ビューのルート要素に `.context-gym` クラスを付ける。配下のコンポーネントは密度依存トークンを通じて自動的に切り替わる（コンポーネント側で分岐コード不要）。

| トークン | ジム外（Compact） | ジム内（Comfortable） | Tailwindクラス例 |
| --- | --- | --- | --- |
| `--text-density-label` | 0.75rem | 0.875rem | `text-density-label` |
| `--text-density-value` | 0.875rem | 1rem | `text-density-value` |
| `--text-density-unit` | 0.875rem | 1rem | `text-density-unit` |
| `--spacing-density-section` | 1.5rem | 1.75rem | `mb-density-section`、`gap-density-section` |
| `--spacing-density-card` | 0.75rem | 1rem | `p-density-card` |
| `--spacing-density-action` | 3.5rem | 3.75rem | `h-density-action` |

利用例:

```tsx
// ビューのルートでジム内コンテキストを宣言
<div className="context-gym">
  <label className="text-density-label">重量</label>
  <div className="text-density-value">120 kg × 5</div>
  <button className="h-density-action">記録する</button>
</div>
```

局所的な上書き（計画ビューの中で一部だけ記録トーンを使いたい等）も可能だが、原則としてビュー単位で統一する（「一貫性のある設計でユーザーの発見を促す」）。

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
