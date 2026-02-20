# packages/tailwind-config

Monorepo全体で共有するTailwind CSS設定を一元管理するパッケージ。テーマ定義のSingle Source of Truthとして機能する（ADR-016）。

## アーキテクチャ

- **Tailwind CSS v4**: CSS-firstの設定方式を採用（ADR-015）。`tailwind.config.js`ではなく`tailwind.css`で設定を定義
- **Intent UI統合**: Intent UIのテーマシステム（OKLch色空間）をベースにしたカラー定義（ADR-014）
- **CSSパッケージ**: `package.json`の`style`フィールドで`tailwind.css`を公開。JavaScriptのエクスポートは持たない

## パッケージ構成

```
packages/tailwind-config/
├── tailwind.css     # 共通のTailwind設定（唯一のファイル）
└── package.json     # styleフィールドでtailwind.cssを指定
```

## tailwind.cssの構成要素

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

## CSS変数の体系

### カラートークン

すべてのカラーはOKLch色空間で定義されている。各カラーは`-fg`（前景色）とペアで定義:

| トークン | 用途 |
| --- | --- |
| `--bg` / `--fg` | ページの背景色・前景色 |
| `--primary` / `--primary-fg` | プライマリカラー（ボタン等） |
| `--primary-subtle` / `--primary-subtle-fg` | プライマリの淡い表現 |
| `--secondary` / `--secondary-fg` | セカンダリカラー |
| `--accent` / `--accent-fg` | アクセントカラー |
| `--muted` / `--muted-fg` | 控えめな表現（無効状態等） |
| `--overlay` / `--overlay-fg` | オーバーレイ（モーダル等） |
| `--success` / `--success-fg` | 成功状態 |
| `--warning` / `--warning-fg` | 警告状態 |
| `--danger` / `--danger-fg` | エラー・危険状態 |
| `--info-subtle` / `--info-subtle-fg` | 情報表示（淡い表現のみ） |
| `--border` / `--input` / `--ring` | ボーダー・入力フィールド・フォーカスリング |
| `--navbar-*` | ナビゲーションバー |
| `--sidebar-*` | サイドバー |
| `--chart-1` 〜 `--chart-5` | チャート用カラーパレット |

### 角丸トークン

`--radius-lg`を基準に、比率で各サイズを算出:

```
--radius-xs: 0.5倍  --radius-sm: 0.75倍  --radius-md: 0.9倍
--radius-lg: 基準    --radius-xl: 1.25倍  --radius-2xl: 1.5倍
--radius-3xl: 2倍    --radius-4xl: 3倍
```

## ダークモード

- **切り替え方式**: `.dark`クラスベース（`@custom-variant dark (&:is(.dark *))`）
- **OS設定連動**: `@media (prefers-color-scheme: dark)`で`--background`と`--foreground`のみ切り替え
- **テーマカラー**: `.dark`クラス内ですべてのCSS変数をダークモード用の値に再定義

## 利用方法

### 1. 依存関係の追加

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

### 2. CSSファイルでのインポート

```css
@import "@next-lift/tailwind-config/tailwind.css";

@source "../../**/*.{js,ts,jsx,tsx}";
```

- `@import`でtailwind-configパッケージを読み込み
- `@source`でTailwindがスキャンすべきファイルパスを指定（利用側で個別に設定）

### 3. ユーティリティクラスの使用

`@theme inline`ブロックで`--color-*`形式にマッピングされているため、Tailwindのユーティリティクラスとして使用可能:

```html
<button class="bg-primary text-primary-fg">Button</button>
<div class="text-muted-fg border-border">...</div>
```

## react-componentsパッケージとの関係

- `packages/react-components`は本パッケージの設定を`@import`して使用する
- react-componentsの`cn`（通常HTML要素用）と`cx`（React Aria Components用）ユーティリティは、本パッケージで定義されたカラートークンをTailwindクラスとして適用する
- 詳細は`packages/react-components/CLAUDE.md`の「クラス名ユーティリティの使い分け」を参照

## 現在の利用箇所

- `apps/web/src/app/globals.css`
- `packages/react-components/src/globals.css`

## 主要な設計判断

- **CSSパッケージとして公開**: JavaScriptのエクスポートは持たず、`package.json`の`style`フィールドのみで配布。`peerDependencies`でTailwind関連パッケージのバージョンを統一
- **OKLch色空間の採用**: 知覚的に均一な配色を実現するため、Intent UIの方針に従いOKLch色空間でカラーを定義
- **将来のデザイントークン化**: iOSアプリ実装時に`packages/design-tokens`を新設し、プラットフォーム非依存のトークン定義に段階的に移行可能な構成（ADR-016）
- **Web専用**: 現時点ではReact Native/iOSでは利用不可。iOSアプリ対応時にデザイントークンパッケージへの移行を検討

## 関連ADR

- [ADR-014: Intent UIの採用](../../docs/architecture-decision-record/014-intent-ui.md)
- [ADR-015: Tailwind CSS v4の採用](../../docs/architecture-decision-record/015-tailwind-css-v4.md)
- [ADR-016: Tailwind設定の共通化](../../docs/architecture-decision-record/016-tailwind-config-package.md)
