# packages/react-components

Next LiftのWebアプリケーション（apps/web）で使用するReactコンポーネントライブラリ。React DOM向け（React Native向けは`packages/react-native-components`）。

## 機能

| 提供機能 | 説明 |
| --- | --- |
| コンポーネント | パッケージルートからimport。プリミティブもビューも区別なく取得可 |
| クラス名ユーティリティ | `./lib` からimport。`cn`（通常HTML要素用）、`cx`（React Aria Components用） |
| デモコンポーネント | `./demo` からimport。Storybook用 |
| Storybook起動 | `pnpm storybook` で実行 |
| Intent UIテンプレート取得 | `pnpm ui:fetch` で実行（[手順書](./docs/fetch-intent-ui-template.md)に従う） |

利用側に対しては「プリミティブ層 / ビュー層」の区別を露出しない。2層構造は内部の組織化のためであり、利用側の関心事ではない（パッケージルートから `Button` も `ProgramList` も同じ形で import する）。

## ディレクトリ構造とコンポーネント配置

詳細な設計判断は [ADR-024: プリミティブ層ポリシーと2層 + 昇格ルール](../../docs/architecture-decision-record/024-primitive-layer-policy.md) を参照。

### 2層構造

```text
src/
├── primitive/                    # プリミティブ層（意見を持たない基礎要素）
│   ├── button.tsx
│   └── ...
└── view/                         # ビュー層（V1〜V15の単位ビュー）
    ├── program-list/
    │   ├── index.tsx             # V1 プログラム一覧
    │   └── program-list-item.tsx # V1 専用のサブコンポーネント（コロケーション）
    ├── program-detail/
    │   └── index.tsx             # V2
    └── set-plan-row.tsx          # 複数ビューで使う共有部品（昇格後）
```

### 配置基準（上から順に判定）

1. V1〜V15 のどれかに対応する → `src/view/{ビュー名}/index.tsx`
2. 特定ビュー専用のサブコンポーネント → `src/view/{ビュー名}/` 配下にコロケーション
3. 複数ビューで使われるドメイン部品（昇格後） → `src/view/` 直下
4. ドメイン用語（Program / Day / ExercisePlan / SetPlan / Workout / Exercise / 1RM など）を含まない汎用部品 → `src/primitive/`

プリミティブ層の判別基準: **ドメイン用語を名前に含まない、意見を持たない、アクセシビリティと基本挙動のみを提供する**。

### 公開エクスポートの方針

利用側に提示するのは **ビューと、ビュー外でも単独利用が想定されるプリミティブ** だけ。具体的には:

- `src/primitive/index.ts`: 各プリミティブを `export *` で公開
- `src/view/index.ts`: 各ビューの `index.tsx` のみ `export`。**サブコンポーネント（`view/{ビュー名}/foo.tsx`）は再エクスポートしない**（internal）
- `src/index.ts`: `primitive` と `view` を統合

サブコンポーネントを公開しない理由:

- ビューは1つのナビゲーション目的地という単位で利用される。内部のサブ部品を外から組み立て直す用途は想定しない
- 昇格時（`view/{ビュー名}/foo.tsx` → `view/foo.tsx` または `primitive/foo.tsx`）に利用側の import パスが壊れない
- `view/{ビュー名}/` 配下が「外から触れない領域」であることが構造で示される

### 昇格ルール

コロケーションされたサブコンポーネントを **2 つ目のビューで使いたくなった時点** で昇格させる。先回りで共有化しない（YAGNI）。

| 昇格条件 | 昇格先 | 操作 |
| --- | --- | --- |
| ドメイン用語を剥がして汎用化できる | `src/primitive/` | 一般名に改名して移動 |
| ドメイン用語を保ったまま共有される | `src/view/` 直下 | そのまま移動 |

**理由（ADR-024より要約）**:

- 所有権が配置で分かる: `view/{ビュー名}/` 配下はそのビュー専用、`view/` 直下は共有資産
- 初期ビューが削除されても孤児化しない
- ビュー間の内部依存（ビューA → ビューBの内部サブコンポーネント）を避ける

### Intent UI の扱い

`pnpm ui:fetch` で取得した Intent UI コンポーネントは **起点テンプレート** として扱う。

- 取得物は `src/.intent-templates/`（git 管理外）に書き込まれる
- そのままコピーせず、参照しながら `src/primitive/` に新規ファイルとして書き起こす
- 意見が混入していれば剥がす（例: Modal の dialog/drawer 自動切替は剥がし済み）
- 意見が剥がしきれない粒度のものは React Aria Components から直接書き直す
- どちらの出自であっても、`src/primitive/` に置かれる時点で「自分たちのコード」

**詳しい取得・書き起こし手順は [docs/fetch-intent-ui-template.md](./docs/fetch-intent-ui-template.md) を参照する**（毎回この手順に従う）。

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
import { Button } from "@next-lift/react-components";

<Button variant="primary">ボタン</Button>
```

### ジム内コンテキストの宣言（GymContext）

Next Liftは**ジム外（計画・振り返り）**と**ジム内（記録）**の2コンテキストを持ち、テキストサイズ・スペーシングが密度依存で切り替わる。

ジム内コンテキストのビュー（V5+V8、V6、およびジムから到達する V9/V13）は、ルートで `GymContext` を宣言する。ジム外はデフォルトなので何も必要ない。

```tsx
import { GymContext } from "@next-lift/react-components";

// V6 セット記録はジム内
export const SetRecordingView = () => (
  <GymContext>
    {/* 配下は Comfortable 密度で表示される */}
    <label className="text-density-label">重量</label>
    <div className="text-density-value">120 kg × 5</div>
  </GymContext>
);
```

- 配下のコンポーネントは `context` prop を持たない。`text-density-*` `p-density-card` などの密度依存クラスを使うだけで自動的に切り替わる
- V9 / V13 のようにジム内・ジム外どちらからも到達するビューは、呼び出し元（ルート層）で `GymContext` の有無を決める。ビュー本体は 1 つでよい
- 密度依存トークンの一覧は `packages/tailwind-config/CLAUDE.md` を参照

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
- 参考実装: [src/primitive/button.tsx](src/primitive/button.tsx)（React 19のref仕様に準拠した実装例）
