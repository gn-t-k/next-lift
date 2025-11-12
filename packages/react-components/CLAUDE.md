# packages/react-components

このパッケージは、Next LiftのWebアプリケーション（apps/web）で使用するReactコンポーネントライブラリです。

**注意**: このパッケージはReact DOM向けです。React Native（iOS）向けのコンポーネントは`packages/react-native-components`で管理します。

## コンポーネント実装規約

### コンポーネントの書き方

すべてのReactコンポーネントは以下の形式で実装してください：

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

**重要なポイント:**

1. **型定義**
   - `import type { FC }` でFCをimport（Tree-shakingのため）
   - Props型は`export`しない（外部に公開しない）
   - Props型名は`Props`（シンプルな名前）
   - `type`を使用（`interface`ではなく）

2. **関数定義**
   - アロー関数 + FC型注釈を使用
   - `export function`ではなく`export const`

3. **ref の扱い（React 19）**
   - React 19では`forwardRef`が不要
   - `ref`は自動的にpropsの一部として扱われる
   - Props型に`ref?: React.Ref<...>`を含める必要なし
   - コンポーネント内で`ref`を明示的に取り出す必要なし
   - `{...props}`でネストされたコンポーネントに自動的に渡される

### 参考実装

- [src/ui/button.tsx](src/ui/button.tsx): React 19のref仕様に準拠した実装例

## クラス名ユーティリティの使い分け

### `cn` - 通常のHTML要素用

- **用途**: 通常のHTML要素の`className`属性
- **対象**: `<div>`, `<pre>`, `<span>`等
- **実装**: `clsx` + `tailwind-merge`
- **戻り値**: `string`

```typescript
import { cn } from "../lib";

<div className={cn("bg-primary", "text-white", className)} />
```

### `cx` - React Aria Components用

- **用途**: React Aria Componentsの`className`レンダープロップ
- **対象**: `<Button>`, `<Link>`, `<Dialog>`等のReact Ariaコンポーネント
- **実装**: `composeRenderProps` + `tailwind-merge`
- **戻り値**: `string | ((v: T) => string)`

```typescript
import { cx } from "../lib";

<Button className={cx("bg-primary", "text-white")} />
```

### 使い分けの判断基準

1. React Ariaコンポーネント（`react-aria-components`からimport）→ `cx`
2. 通常のHTML要素 → `cn`

### 理由

React Aria Componentsの`className`プロパティは、レンダープロップ（関数）を受け付けます。これにより、コンポーネントの状態（hover、pressed等）に応じて動的にクラス名を変更できます。

`cx`は`composeRenderProps`を使用してこの機能をサポートしていますが、通常のHTML要素の`className`属性は`string`のみを受け付けるため、`cn`を使用する必要があります。
