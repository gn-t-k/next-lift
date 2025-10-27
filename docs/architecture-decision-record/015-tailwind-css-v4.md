# ADR-015: Tailwind CSS v4の採用

## ステータス

Accepted

## 関連ADR

- [ADR-014: Intent UIの採用](./014-intent-ui.md) - Tailwind CSSを使用するUIライブラリ

## コンテキスト

Next LiftのWebアプリケーションにおいて、CSSフレームワークの選定が必要だった。以下の要件を考慮した：

- **最新技術の採用**: 最新版を使わない理由がない限り、最新版を使う方針
- **エコシステムの大きさ**: Intent UIなどの出来合いコンポーネントライブラリが豊富に存在すること
- **開発効率**: 個人開発の時間制約を考慮し、エコシステムを活用できること
- **個人的嗜好**: vanilla-extractやCSS手書きへの愛着はあるが、実用性を優先

## 決定内容

**Tailwind CSS v4**をCSSフレームワークとして採用する。

### Tailwind CSS v4の特徴

- **新しいCSS変数システム**: `@theme`ブロックでカスタムトークンを定義
- **パフォーマンス向上**: 新しいエンジンによる高速なビルド
- **ゼロ設定**: 設定ファイルなしでも動作（`@import "tailwindcss"`のみ）
- **PostCSSプラグイン不要**: Viteなどのモダンビルドツールとネイティブ統合

### 重要な仕様変更（v3→v4）

#### CSS変数の定義方法

v4では、カスタムカラーなどのCSS変数は`@theme`ブロック内で定義する必要がある：

```css
@import "tailwindcss";

@theme {
  --color-primary: oklch(0.546 0.245 262.881);
  --color-secondary: oklch(0.92 0.004 286.32);
}
```

#### ユーティリティクラスの生成

`--color-*`形式で定義すると、`bg-*`、`text-*`などのユーティリティクラスとして自動的に使用可能：

```html
<button class="bg-primary text-primary-fg">Button</button>
```

#### `@apply`での使用

`@apply`でカスタムクラスを使う場合も、`@theme`ブロックでの定義が必要：

```css
@theme {
  --color-background: #ffffff;
}

@layer base {
  body {
    /* これはエラーになる（v3では動作した） */
    /* @apply bg-background; */

    /* 正しい方法 */
    background-color: var(--color-background);
  }
}
```

### トラブルシューティング

#### エラー: `Cannot apply unknown utility class 'bg-background'`

**原因**: `@apply bg-background`のようなコードで、`--color-background`が`@theme`ブロックで定義されていない。

**解決方法**:
1. `@theme`ブロックで`--color-background`を定義する
2. または、`@apply`を使わず`background-color: var(--background);`のように直接CSS変数を使う

## 結果・影響

### メリット

- **エコシステムの大きさ**: Intent UIなどの出来合いコンポーネントライブラリが豊富
- **開発効率**: 完成品を活用して開発をスタートできる
- **最新技術**: v4の新機能を活用可能
- **パフォーマンス**: 新しいエンジンによる高速なビルド
- **Intent UI統合**: Intent UIがTailwind CSSを前提としているため、シームレスに統合可能

### デメリット

- **学習コスト**: v4の新しい記法（`@theme`ブロックなど）を理解する必要がある
- **移行コスト**: v3からの移行時、既存コードの修正が必要
- **個人的嗜好**: vanilla-extractやCSS手書きの方が好みだが、エコシステムを優先

## 代替案

以下の選択肢を検討した：

### Tailwind CSS v3

v4より安定したバージョン。

- **メリット**: より安定している、ドキュメントが充実
- **却下理由**: 最新を使わない理由がない（v4で問題が発生した場合は、その時点でv3に戻せばよい）

### vanilla-extract

本業で使用しているCSS-in-JSソリューション。

- **メリット**: TypeScript型安全性、ゼロランタイム、慣れている
- **却下理由**: Intent UIのような出来合いコンポーネントライブラリが存在しない

### CSS Modules / 手書きCSS

従来型のCSSソリューション。

- **メリット**: 完全な自由度、個人的には好み
- **却下理由**: 個人開発の時間制約上、エコシステムを優先（本業と別にやっているプロジェクトで、時間がそれほどあるわけではない）

### UnoCSS

Tailwind CSS互換のアトミックCSSエンジン。

- **メリット**: パフォーマンスが高い、柔軟性が高い
- **却下理由**: Intent UIのエコシステムがTailwind CSSを前提としている

## トレードオフ

Tailwind CSS v4の採用は以下のトレードオフを伴う：

- ✅ エコシステムの大きさ、Intent UI統合、開発効率、最新技術
- ❌ 学習コスト、個人的嗜好との乖離

ただし、個人開発において時間制約があり、完成品（Intent UI）を活用して開発をスタートすることを優先するため、Tailwind CSS v4が最適な選択肢である。vanilla-extractやCSS手書きへの愛着はあるが、エコシステムと実用性を優先した。

## 決定日

2025-10-27
