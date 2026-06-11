# packages/react-components

Next LiftのWebアプリケーション（apps/web）で使用するReactコンポーネントライブラリ。React DOM向け（React Native向けは`packages/react-native-components`）。

## 機能

| 提供機能 | 説明 |
| --- | --- |
| コンポーネント | パッケージルートからimport。プリミティブもビューも区別なく取得可 |
| クラス名ユーティリティ | `./libs` からimport。基本は `cn`、consumer から render-prop callback の className を pass-through するときだけ `cx` |
| デモコンポーネント | `./demo` からimport。Storybook 用の playground。**本番コンポーネント（primitive / view）から流用しない**（demo にあるという事実だけでは production-ready の保証にならない。必要なら primitive として書き直すか、各 view 用に独自実装する） |
| Storybook起動 | `pnpm storybook` で実行 |
| Intent UIテンプレート取得 | `pnpm ui:fetch` で実行（[手順書](./docs/fetch-intent-ui-template.md)に従う） |

利用側に対しては「プリミティブ層 / ビュー層」の区別を露出しない。2層構造は内部の組織化のためであり、利用側の関心事ではない（パッケージルートから `Button` も `ProgramList` も同じ形で import する）。

## ディレクトリ構造とコンポーネント配置

詳細な設計判断は [ADR-024: プリミティブ層ポリシーと2層 + 昇格ルール](../../docs/architecture-decision-record/024-primitive-layer-policy.md) を参照。

### 2層構造

```text
src/
├── primitives/                         # プリミティブ層（意見を持たない基礎要素）
│   ├── button/
│   │   ├── index.tsx                   # 本体
│   │   └── index.stories.tsx
│   ├── modal/
│   │   ├── index.tsx                   # 本体
│   │   ├── index.stories.tsx
│   │   └── dialog.tsx                  # Modal の内部実装（再エクスポートしない、internal）
│   ├── toggle-button-group/
│   │   ├── index.tsx                   # MultiToggleButtonGroup / SingleToggleButtonGroup / ToggleButton を併記
│   │   └── index.stories.tsx
│   ├── main/                           # ページのコンテナ（`<main>` 要素 + width 制御）
│   └── ...
└── views/                              # ビュー層（V1〜V15の単位ビュー）
    ├── program-list/
    │   ├── index.tsx                   # ProgramList / ProgramListLoading / ProgramListError を併記
    │   ├── index.stories.tsx
    │   └── program-list-item.tsx       # V1 専用のサブコンポーネント（コロケーション、internal）
    ├── program-detail/
    │   ├── index.tsx                   # V2
    │   └── index.stories.tsx
    └── set-plan-row.tsx                # 複数ビューで使う共有部品（昇格後）
```

ディレクトリの本体は `index.tsx` に置く。`coding-style.md` の「ファイル名 = export 名」原則は、フォルダコロケーション形式では「ディレクトリ名 = export 名」に拡張して適用する（`primitives/button/index.tsx` → `Button`）。中身ゼロのバレルファイル（`export * from "./xxx"` のみ）は作らない。

利用側の import path（例: `"../primitives/button"`）はディレクトリ単位なので、フォルダ解決によって `index.tsx` を拾う。consumer 側の書き換えは発生しない。

バリアント群（例: `MultiToggleButtonGroup` / `SingleToggleButtonGroup` / `ToggleButton`、`ProgramList` / `ProgramListLoading` / `ProgramListError`）は **同一の `index.tsx` 内に複数 export を併記する**。`coding-style.md` の「1 ファイル 1 コンポーネント」原則に対する明示的な例外。

- ✅ 同じドメイン概念のバリアント（同名 prefix・概念上の同根）は 1 ファイルにまとめる。共通の shell / styles / 内部型をファイル内で colocate できる
- ❌ 各 variant が視覚的に大きく異なってレイアウト共有もできず、`index.tsx` が 250 行を超えるなら、独立コンポーネントとして再評価する（別ディレクトリに切り出す）

サブコンポーネント（`modal/dialog.tsx` `program-list/program-list-item.tsx` のような特定の親に従属する internal 部品）は別ファイルとしてフォルダ内にコロケーションする（バリアントではないので統合対象外）。

### ページクロムとビューの責務分離

ビュー（V1〜V15）は **ページクロム（`<main>` / `<section>` 等のコンテナ要素）を持たない**。ビューが返すのは「そのビュー固有のコンテンツ」（リスト、フォーム、ステート表示等）のみ。ページのコンテナは consumer（apps/web 等）が組み立てる責務。

```tsx
// 利用例（V1 はリスト見出しをビューが持たないため、ページタイトルは consumer が組む）
<Main>
  <Heading>プログラム</Heading>
  <ProgramList programs={...} createHref="..." />
</Main>
```

理由:
- ビューがコンテナ要素（main / section）を固定できない（呼び出し元のドキュメントアウトラインに依存）

見出し（`<h1>`〜`<h6>`）はビュー内で直書きせず、`Heading` プリミティブを使う。レベルは `Section` のネスト深度から自動採番されるため、ビューを別の文脈に置いても見出しレベルが破綻しない（詳細は `.claude/rules/react.md` の「見出しは Heading primitive を使う」）。リスト系のようにビュー自身が見出しを持たないものは consumer が組む。詳細系（V2 のプログラム名など、ビューのオブジェクト名そのものが見出しになるもの）はビュー内部で `Heading` を描画してよい。

`Main` / `Section` / `Heading` プリミティブは `primitives/` に配置し、すべてのビューが共通で使える。3つは HTML 要素（`<main>` / `<section>` / `<hN>`）と1対1対応するメンタルモデルで使う。

### ビューと consumer の境界

ビュー（`src/views/`）の props / コールバックは **永続化層（Drizzle の `null` 等）を知らない**。DB や ORM との型変換は consumer（`apps/web` 等）が担う。

#### 欠如の表現は `undefined` に統一する

| 状況 | ビュー層での表現 |
| --- | --- |
| テキストフィールドに値がない（メモ未入力・クリア後） | `undefined`、またはコールバックで `""` をそのまま渡す |
| optional な props を省略 | `undefined`（`prop?: T`） |
| 派生 state でまだ解決されていない（未選択の Day 等） | `undefined`（`.find` の戻り値など） |

`null` はビュー層では使わない。`string | null` と `string | undefined` を併用すると解釈が分岐するだけなので、ビュー内は `undefined` に揃える。

#### consumer の責務

- **渡すとき**: Drizzle row の `metaInfo: string | null` などを、ビュー用の ViewModel（`meta?: string`）に変換する（例: `meta: row.metaInfo ?? undefined`）
- **受け取るとき**: コールバックの `memo: ""` や `meta` 省略を、DB の `NULL` / 空文字など好みの保存形式に変換する

ビュー側で `nextMemo === "" ? null : nextMemo` のように永続化向けの変換をしない。

#### ドメイン型のコロケーション（ビュー内部）

型専用ファイル（`types.ts` 等）は置かない。ドメイン型は **オーナーコンポーネント** のファイルで `export type` し、他はそこから `import type` する。

| 型 | オーナー | 選定理由 |
| --- | --- | --- |
| エンティティ（`Day`, `ExercisePlan`, `SetPlan` 等） | そのエンティティの **リスト UI**（`*-list.tsx`） | データ形状を最も多く扱うコンポーネント |
| 編集 payload（`DayInfoPayload` 等） | **編集 UI**（`*-dialog-button.tsx` 等） | フォームが返す形の正本 |
| callback / render prop | **呼び出すコンポーネント**（`*-list.tsx`, `*-header-actions.tsx` 等） | invoker が contract を決める。`Props["onX"]` や render 専用 alias で `export type` |
| ビュー内共有 props（Miller / Drilldown） | `miller-columns.tsx` の `ProgramPlanViewProps` | 子の export を組み立てる |
| 公開 Props（`ProgramDetailNew`） | `index.tsx` | データ props + `Pick<ProgramPlanViewProps, …>` で組み立て |

参照元が複数あっても正本は一つ。「どちらを正にする？」は **UI の責務** で決める（リスト vs 編集ダイアログ）。`ComponentProps<typeof ProgramDetailNew>` からの再抽出は Story など公開 API を直接触る箇所に限る。

エンティティ間の型依存（`Day` → `ExercisePlan` → `SetPlan`）は `import type` の循環でよい。leaf（`set-plan-list`）から root（`day-list`）方向に定義する。

#### ビュー内カスタム hook

単体なら `use-{名前}.ts`。純関数・test など sibling が必要なときだけ `use-{名前}/index.ts` にまとめる（ファイル命名は `.claude/rules/coding-style.md`）。ディレクトリ化した sibling は hook からのみ import する。

UI には状態の正本だけ渡す。表示用の派生値は hook から広げず、各コンポーネントで render 時に計算する（`.claude/rules/react.md` の「派生値は計算で求める」）。

#### 共有フォームとの接続

旧ビューや共有部品（例: `ProgramInfoForm`）がまだ `string | null` を使う場合、**ビュー専用のラッパー**（例: `program-info-dialog-button.tsx`）で境界変換する。共有部品を一括変更するのは別タスク。

### 配置基準

コンポーネントは primitives と views のいずれかに置く。

- views: ドメイン用語（Program / Day / ExercisePlan / SetPlan / Workout / Exercise / 1RM など、Next Lift のビジネスドメインに固有の概念名）を表現するコンポーネント。
- primitives: ドメイン用語を含まない汎用部品。意見を持たず、アクセシビリティと基本挙動のみを提供する。CRUD 操作（Create / Edit / Delete）やフォーム要素（Button / Field / Selector）はドメイン用語ではない。

判定の目安: 別ジャンルのアプリ（ToDo / 家計簿 / レシピ等）に名前ごと持っていって意味が通るか。通る → primitives、通らない → views。

- 通る例: `CreateAffordance`（項目を新規追加する破線枠のアフォーダンス）→ primitives
- 通らない例: `SetPlanRow`（セット計画の行）→ `views/program-detail/`

#### views 内部の配置

1. ビュー本体（V1〜V15、normal 状態） → `src/views/{ビュー名}/index.tsx`
2. 状態バリアント（loading / error 等、normal と構造が異なる） → ビュー本体と同じ `index.tsx` 内に併記して export
3. 特定ビュー専用のサブコンポーネント → `src/views/{ビュー名}/` 配下に別ファイル（internal、`index.tsx` から export しない）
4. 複数ビューで使われるドメイン部品（昇格後） → `src/views/{名前}/index.tsx`

#### primitives の配置

`src/primitives/{名前}/index.tsx`。バリアント群（例: `MultiToggleButtonGroup` / `SingleToggleButtonGroup`）は同じ `index.tsx` 内に併記する。

### 公開エクスポートの方針

利用側に提示するのは **ビュー（状態バリアント含む）と、ビュー外でも単独利用が想定されるプリミティブ** だけ。具体的には:

- `src/primitives/index.ts`: 各プリミティブフォルダを `export *` で公開（フォルダ解決で `primitives/{名前}/index.tsx` 本体を拾う）。internal な context や helper を hide したい場合のみ、対象ディレクトリだけ named export に切り替える（例: `heading` の `HeadingContext` を internal に保つため `export { Heading, Section } from "./heading"`）
- `src/primitives/{名前}/index.tsx`: ビュー本体を直接定義する。**internal なサブコンポーネント（例: `modal/dialog.tsx`）は同じディレクトリの別ファイルに置き、`index.tsx` から再エクスポートしない**
- `src/views/index.ts`: 各ビューフォルダを `export *` で公開（フォルダ解決で `views/{ビュー名}/index.tsx` 本体を拾う）
- `src/views/{ビュー名}/index.tsx`: ビュー本体と状態バリアント（同一ファイル内に併記）を export する。**サブコンポーネント（`{ビュー名}-item.tsx` 等）は別ファイルに置き、再エクスポートしない**（internal）
- `src/index.ts`: `primitives` と `views` を統合

サブコンポーネントを公開しない理由:

- ビューは1つのナビゲーション目的地という単位で利用される。内部のサブ部品を外から組み立て直す用途は想定しない
- 昇格時（`views/{ビュー名}/foo.tsx` → `views/foo.tsx` または `primitives/{名前}/{名前}.tsx`）に利用側の import パスが壊れない
- `views/{ビュー名}/` 配下が「外から触れない領域」であることが構造で示される

状態バリアントを別コンポーネントとして公開する理由:

- 各コンポーネントの props を最小化できる（`isLoading` / `error?` といった条件 props を持たない）
- 表示切替ロジックがアプリ層に明示され、Suspense / ErrorBoundary との合流が自然になる
- 状態間で共通する視覚要素（ヘッダーや常時カード）はビューフォルダ内で共有する

### 昇格ルール

コロケーションされたサブコンポーネントを **2 つ目のビューで使いたくなった時点** で昇格させる。先回りで共有化しない（YAGNI）。

| 昇格条件 | 昇格先 | 操作 |
| --- | --- | --- |
| ドメイン用語を剥がして汎用化できる | `src/primitives/{名前}/` | 一般名に改名してフォルダごと作成 |
| ドメイン用語を保ったまま共有される | `src/views/` 直下 | そのまま移動 |

**理由（ADR-024より要約）**:

- 所有権が配置で分かる: `views/{ビュー名}/` 配下はそのビュー専用、`views/` 直下は共有資産
- 初期ビューが削除されても孤児化しない
- ビュー間の内部依存（ビューA → ビューBの内部サブコンポーネント）を避ける

### Intent UI の扱い

`pnpm ui:fetch` で取得した Intent UI コンポーネントは **起点テンプレート** として扱う。

- 取得物は `src/.intent-templates/`（git 管理外）に書き込まれる
- そのままコピーせず、参照しながら `src/primitives/{名前}/` に新規ファイルとして書き起こす
- 意見が混入していれば剥がす（例: Modal の dialog/drawer 自動切替は剥がし済み）
- 意見が剥がしきれない粒度のものは React Aria Components から直接書き直す
- どちらの出自であっても、`src/primitives/` に置かれる時点で「自分たちのコード」

**詳しい取得・書き起こし手順は [docs/fetch-intent-ui-template.md](./docs/fetch-intent-ui-template.md) を参照する**（毎回この手順に従う）。

## 使い方

### クラス名ユーティリティの使い分け

#### ルール 1: consumer の `className` 上書きには `cn` / `cx` が必須

consumer が渡す `className` で tailwind-merge を効かせて安全な上書きを保証するために、`cn` / `cx` を必ず経由する。静的 class が 1 つだけでも必要。

```tsx
// ❌ 単純連結: p-2 と p-4 が両方 class に入り、CSS 適用順が build 順依存になる
<Label className={`block p-2 ${className}`} />

// ✅ cn 経由: tailwind-merge が p-4 を p-2 より優先させる
<Label className={cn("block p-2", className)} />
```

#### ルール 2: render-prop callback の pass-through を行うときだけ `cx`

判断軸は「**自分のコンポーネントが consumer から render-prop callback の className を受け取って下流に pass-through するか**」。受け取った `className` に関数が含まれうるとき（= 自分の props の `className` 型に `((v) => string)` が含まれるとき）だけ `cx` が必要。それ以外はすべて `cn`。

| ケース | 使うヘルパー |
| --- | --- |
| 自分のコンポーネントが consumer の className を一切受け取らず、内部で静的な class だけ組み立てる | `cn` |
| consumer の className を受け取るが、自分の props の `className` 型が `string \| undefined` のみ（function を含まない） | `cn` |
| consumer の className を受け取り、自分の props の `className` 型が `string \| ((v) => string) \| undefined`（function を含む）。callback を関数のまま下流に渡す必要がある | `cx` |

「下流の React Aria コンポーネントの className が render-prop を受け付ける」だけでは `cx` の理由にならない。`cn` の戻り値（`string`）も render-prop 型の union に代入できる。自分のコンポーネントが consumer から callback を受け取るかどうかで判断する。

`cx`（`libs/primitive.ts`）は `composeRenderProps` を内部で使い、render-prop callback を関数のまま受けて最終的に `twMerge` する。string-only の `className` に `cx` の戻り値（関数型）を渡すと型エラーになる。

```typescript
import { cn } from "@next-lift/react-components/libs";

// 通常の HTML 要素
<div className={cn("bg-primary", "text-white", className)} />

// React Aria の string-only className（Label / Text / Separator 等）
<Label className={cn("block font-medium", className)} />

// 内部で静的に組むだけ（consumer の className を受け取らない）
<Button className={cn("flex w-full items-center justify-center p-6")} />

// consumer の className を受け取るが、自分の props 型は string のみ
type Props = { className?: string };
<ModalPrimitive className={cn(contentStyles({ size }), className)} />
```

```typescript
import { cx } from "@next-lift/react-components/libs";

// 自分の props の className が render-prop（consumer が callback を渡しうる）
type Props = ButtonPrimitiveProps; // className: string | ((v) => string) | undefined
<ButtonPrimitive className={cx("bg-primary", className)} />
<TabPrimitive className={cx("rounded-md font-medium", className)} />
```

#### ルール 3: static class は inline（`cn` / `cx` 可変引数）を default にする

| 書き方 | 評価 |
| --- | --- |
| `cn("block p-2 text-fg", className)` | ✅ 推奨。一度しか参照しない static class は最も素直 |
| `const labelClass = "block p-2 text-fg"; cn(labelClass, className)` | △ 同じ static class が **2 箇所以上** から参照される時のみ |
| `tv({ base: ["block", "p-2"] })` — variants なし | ❌ 禁止。`tv` の利点（variant 拡張・twMerge）を使わない文字列定数と等価 |
| `["block", "p-2"].join(" ")` | ❌ 禁止。可変引数で `cn` / `cx` に直接渡せばよい |
| `tv({ base, variants: { ... } })` | ✅ variants / slots を使う場合のみ `tv` を使う |

```tsx
// ✅ 推奨: inline 可変引数
<Label className={cn("block font-medium text-base/6 text-fg sm:text-sm/6", className)} />

// ❌ 禁止: variants なしの tv
const labelStyles = tv({ base: ["block", "font-medium"] });
<Label className={cn(labelStyles(), className)} />

// ❌ 禁止: .join(" ")
const labelClass = ["block", "font-medium"].join(" ");
```

#### ルール 4: 配列 + `.join(" ")` は使わない

`cn` / `cx` の可変引数（内部で `clsx` を使用）に直接渡す。

```tsx
// ❌
const classes = ["flex", "flex-col", "gap-4"].join(" ");
<div className={cn(classes, className)} />

// ✅
<div className={cn("flex", "flex-col", "gap-4", className)} />
// または長い場合は一文字列で
<div className={cn("flex flex-col gap-4", className)} />
```

#### ルール 5: prop で class を切り替えるなら object lookup ではなく `tv` を使う

prop の値で複数のクラスを切り替える場面は object lookup（`Record<Variant, string>`）で書かず、`tv` の variants として宣言する。

| 書き方 | 評価 |
| --- | --- |
| object lookup（`const widthClasses = { narrow: "...", wide: "..." }` を `cn` に渡す） | ❌ 禁止。variant 名・型・classが分散し、`tv` の利点（variants/compoundVariants/型派生）を使わない |
| `tv({ variants: { width: { narrow, wide } } })` + `VariantProps` | ✅ 推奨。`Props` の型は `VariantProps<typeof xxxStyles>` で派生させる |

```tsx
// ❌ 禁止: object lookup でクラス切替
const widthClasses = {
  narrow: "max-w-2xl",
  wide: "max-w-screen-xl",
} satisfies Record<NonNullable<Props["width"]>, string>;

type Props = { width?: "narrow" | "wide" };

export const Main: FC<PropsWithChildren<Props>> = ({ width = "narrow", children }) => (
  <main className={cn("mx-auto w-full p-4", widthClasses[width])}>{children}</main>
);

// ✅ 推奨: tv の variants として宣言、Props は VariantProps で派生
type Props = VariantProps<typeof styles>;

export const Main: FC<PropsWithChildren<Props>> = ({ width, children }) => (
  <main className={styles({ width })}>{children}</main>
);

const styles = tv({
  base: "mx-auto w-full p-4",
  variants: {
    width: {
      narrow: "max-w-2xl",
      wide: "max-w-screen-xl",
    },
  },
  defaultVariants: { width: "narrow" },
});
```

`styles` は internal helper なのでファイル下部にまとめる（`coding-style.md` の「ファイル先頭に近い位置に export を置く」原則）。コンポーネント本体は遅延評価なので後方参照で問題ない。

**Why:** variants が増えたとき（`size` 追加、`compoundVariants` 等）に `tv` なら自然に拡張できる。object lookup は variant ごとに新しい lookup table を増やすことになり、二重管理になる。また `VariantProps` で型を派生できるので、`Props["width"]` を別途定義する必要がない。

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
- 参考実装: [src/primitives/button/button.tsx](src/primitives/button/button.tsx)（React 19のref仕様に準拠した実装例）
