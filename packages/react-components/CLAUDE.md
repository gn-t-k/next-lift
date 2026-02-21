# packages/react-components

Next LiftのWebアプリケーション（apps/web）で使用するReactコンポーネントライブラリ。React DOM向け（React Native向けは`packages/react-native-components`）。

## 機能

| 提供機能 | 説明 |
| --- | --- |
| UIコンポーネント | `./ui` からimport。Button等 |
| クラス名ユーティリティ | `./lib` からimport。`cn`（通常HTML要素用）、`cx`（React Aria Components用） |
| デモコンポーネント | `./demo` からimport。Storybook用 |
| Storybook起動 | `pnpm storybook` で実行 |
| shadcnコンポーネント追加 | `pnpm ui:add` で実行 |

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

// React Aria Componentsに使用。classNameが関数（レンダープロップ）の場合もマージ可能
<Button className={cx("bg-primary", className)} />
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

**childrenを受け取るコンポーネント:**

```typescript
import type { FC, PropsWithChildren } from "react";

type Props = {
  // props定義
};

export const ComponentName: FC<PropsWithChildren<Props>> = ({ children, ...props }) => {
  // 実装
};
```

**ポイント:**

- `import type { FC }` でFCをimport（Tree-shakingのため）
- Props型は`export`しない、名前は`Props`、`type`を使用（`interface`ではなく）
- アロー関数 + FC型注釈を使用（`export function`ではなく`export const`）
- React 19では`forwardRef`が不要。`ref`は自動的にpropsの一部として扱われる
- `children`を受け取る場合は`PropsWithChildren<Props>`を使用

## 制約と注意事項

- React DOM専用。React Nativeでは使用不可
- カラートークンは`@next-lift/tailwind-config`で定義（本パッケージで独自定義しない）
- 参考実装: [src/ui/button.tsx](src/ui/button.tsx)（React 19のref仕様に準拠した実装例）
