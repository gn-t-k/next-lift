# packages/react-components

Next LiftのWebアプリケーション（apps/web）で使用するReactコンポーネントライブラリ。React DOM向け（React Native向けは`packages/react-native-components`）。

## 機能

| パス | 説明 |
| --- | --- |
| `./ui` | UIコンポーネント群（Button等）|
| `./lib` | `cn`（通常HTML要素用）、`cx`（React Aria Components用）クラス名ユーティリティ |
| `./demo` | Storybook用デモコンポーネント |
| `pnpm storybook` | Storybookの起動 |
| `pnpm ui:add` | shadcnコンポーネントの追加 |

## 使い方

### クラス名ユーティリティの使い分け

#### `cn` - 通常のHTML要素用

```typescript
import { cn } from "@next-lift/react-components/lib";

// 通常のHTML要素（div, pre, span等）に使用
<div className={cn("bg-primary", "text-white", className)} />
```

#### `cx` - React Aria Components用

```typescript
import { cx } from "@next-lift/react-components/lib";

// React Aria Components（Button, Link, Dialog等）に使用
// className レンダープロップ（関数）をサポート
<Button className={cx("bg-primary", "text-white")} />
```

### コンポーネントの利用

```typescript
import { Button } from "@next-lift/react-components/ui";

<Button variant="primary">ボタン</Button>
```

## 開発ガイド

### コンポーネントの書き方

```typescript
import type { FC } from "react";

type Props = {
  // props定義
  // React 19では ref は自動的に Props に含まれるため、明示的に定義する必要なし
};

export const ComponentName: FC<Props> = ({ ...props }) => {
  // 実装
};
```

**ポイント:**
- `import type { FC }` でFCをimport（Tree-shakingのため）
- Props型は`export`しない、名前は`Props`、`type`を使用（`interface`ではなく）
- アロー関数 + FC型注釈を使用（`export function`ではなく`export const`）
- React 19では`forwardRef`が不要。`ref`は自動的にpropsの一部として扱われる

### cn / cx の実装詳細

- `cn`: `clsx` + `tailwind-merge` → 戻り値は `string`
- `cx`: `composeRenderProps` + `tailwind-merge` → 戻り値は `string | ((v: T) => string)`
- React Aria Componentsの`className`プロパティはレンダープロップ（関数）を受け付けるため、`cx`が必要

## 制約と注意事項

- React DOM専用。React Nativeでは使用不可
- カラートークンは`@next-lift/tailwind-config`で定義（本パッケージで独自定義しない）
- 参考実装: [src/ui/button.tsx](src/ui/button.tsx)（React 19のref仕様に準拠した実装例）
