---
description: React コンポーネント実装ルール
paths:
  - "**/*.tsx"
---

# React コンポーネント実装ルール

`.tsx` ファイルを編集する際に適用するルール。

## ビュー層の props は `undefined` で欠如を表す

`packages/react-components/src/views/` の公開 props / コールバックでは `null` を使わない。永続化層（Drizzle の `null` 等）との変換は consumer の責務。詳細は `packages/react-components/CLAUDE.md` の「ビューと consumer の境界」を参照。

## 派生値は計算で求める

- props 由来の値を `useState` + `useEffect` で同期するパターンは避ける
- 派生は render 時の計算で行う（"calculate during rendering"）
- ユーザーの編集中の draft と props 由来の表示値を分離したい場合は `draft ?? derived` のパターンを使う
- どうしても `useEffect` を使うことになったときは [You Might Not Need an Effect](https://ja.react.dev/learn/you-might-not-need-an-effect) を参照したか確認する

```tsx
// ❌ props を state にコピーして useEffect で同期
const [inputValue, setInputValue] = useState(selectedName);
useEffect(() => {
  setInputValue(selectedName);
}, [selectedName]);

// ✅ draft + 派生値で計算
const [draft, setDraft] = useState<string | null>(null);
const inputValue = draft ?? selectedName;
```

## メモ化は基本不要

- apps/web は React Compiler 有効。`useMemo` / `useCallback` / `React.memo` は基本書かない
- 派生値（小さい配列の `find` / `filter` / `map` など）は素直に式で書く
- Storybook は React Compiler 非対応だが、計算が軽ければ実用上の差は出ない
- 高コスト計算で本当に必要な場面だけ手動メモ化する

## 公開 API は ComponentProps で派生させる

- コンポーネントの入力型を別名で `export` しない
- consumer は `ComponentProps<typeof Foo>["xxx"]` で型を派生
- 「Foo に渡す値を作っている」という意味が型に出るので、ドメイン型と紛らわしくならない

```tsx
// ❌ 型を別名 export
export type FooItem = { id: string; name: string };
export const Foo: FC<{ items: FooItem[] }> = ...;

// ✅ コンポーネントだけ export、型は派生
type Props = { items: { id: string; name: string }[] };
export const Foo: FC<Props> = ...;

// consumer 側
type Item = ComponentProps<typeof Foo>["items"][number];
```

内部 cross-file 共有でも同じ。`ExerciseSelectorProps` のような共有型を用意するより `ComponentProps<typeof ExerciseSelector>` で派生させる。

## ヘルパー関数と UI 文言の分離

- 純粋関数（filter / 状態判定 / リスト構築など）は構造的な計算のみ持つ
- ユーザー向けメッセージ・ラベル文言はコンポーネント側に置く
- 関数のテストが文言の影響を受けない、ロジックと文言が独立して変更できる

```ts
// ❌ ヘルパーが文言を持つ
const computeCreateState = (...) => ({
  label: trimmed === "" ? "種目を登録" : `種目「${trimmed}」を登録`,
  isDisabled: ...,
});

// ✅ ヘルパーは状態だけ返す
const isCreatableName = (existingNames, query): boolean => { ... };

// コンポーネント側で文言を組む
const label = trimmedQuery === "" ? "種目を登録" : `種目「${trimmedQuery}」を登録`;
```

## フォルダ単位コンポーネントは index.tsx を直接エントリに

- 1コンポーネント = 1フォルダの構成では、barrel `index.ts` + 別名 `xxx.tsx` を分けず、`index.tsx` 自体をコンポーネント本体にする
- サブコンポーネント・helper はフォルダ内にコロケーション

```
views/exercise-selector/
  index.tsx                   # ExerciseSelector 本体
  exercise-selector-combo-box.tsx
  exercise-selector-drawer.tsx
  filter-by-name.ts / .test.ts
  ...
```

## use(promise) パターン

`use(promise)` を呼ぶコンポーネントの内部で `useMemo` を使って promise を生成しない。promise は **非 suspend な親コンポーネント** で生成し、suspend する子に prop として渡す。

**Why:** React 19 の Suspense モデルでは、初回 render で suspend したコンポーネントは hooks state がコミットされない。promise resolve 後の再描画で `useMemo` が再度走って新しい promise を生成 → その新 promise も pending → 再 suspend、という永久ループに陥る。

```tsx
// 非 suspend な親
const Boundary: FC<Props> = ({ deps }) => {
  const promise = useMemo(() => fetchData(deps), [deps]);
  return (
    <ErrorBoundary fallback={...}>
      <Suspense fallback={...}>
        <AwaitedChild promise={promise} />
      </Suspense>
    </ErrorBoundary>
  );
};

// suspend する子（promise は prop として受け取る）
const AwaitedChild: FC<{ promise: Promise<T> }> = ({ promise }) => {
  const data = use(promise);
  return <Presenter data={data} />;
};
```

「中間層が冗長に見える」と畳まない。replay UX が必要なら親 `Boundary` 自体に `key={remountKey}` を渡してまるごと remount する。

## 見出しは Heading primitive を使う

- `<h1>` 〜 `<h6>` を直書きしない。`@next-lift/react-components` の `Heading` を使う
- 見出しレベルを 1 段深くしたいときは `Section` で囲む（`<section>` 要素 + heading scope を提供）
- `Heading` はネスト深度から自動的に `h1`〜`h6` を解決する。consumer が level を明示指定する API は持たない

```tsx
import { Heading, Section } from "@next-lift/react-components";

// ページタイトル（h1）
<Heading>プログラム</Heading>

// 1段ネスト → h2 になる
<Section>
  <Heading>セクションタイトル</Heading>
</Section>

// 2段ネスト → h3
<Section>
  <Section>
    <Heading>サブセクション</Heading>
  </Section>
</Section>
```

**Why:** ビューが見出しレベルをハードコードすると、ビューを別の文脈に置いたときにアウトラインが破綻する（h1 を 2 つ含むページ、h2 を飛ばして h3 が出る等）。`Section` のネスト深度から自動採番すれば、ビューの再配置で見出しレベルが自然に追従する。

**How to apply:** 新規ビュー/プリミティブ実装時、または既存コードから `<h*>` 直書きを見つけた時。Heading は level に応じたデフォルトスタイル（font-weight + text-size）を持つので、特殊な見た目が必要な場合のみ `className` で上書きする。

## Storybook ストーリーは実アプリ構成を示す

ストーリーは見た目の確認だけでなく、**利用側（apps/web 等）が実際にどう組み立てるかのドキュメント** として書く。

- 状態遷移系: 手動 state ではなく React 19 の `use()` API + `Suspense` + `ErrorBoundary`（`react-error-boundary` 推奨）で本物の構成を再現
- ページ全体: `PageSection` + `Heading` 等のクロムを decorator や FlowDemo に含めて、利用側の組み立てそのものを見せる
- データ取得: `setTimeout` で resolve/reject する Promise をモックとして使い、実アプリの `useSuspenseQuery` や Server Component await の代わりに据える
- 「このストーリー専用のアダプター」（例: `SuspendedProgramList`）として use() を呼ぶラッパーを置き、純プレゼンテーショナルな本体と利用層を分離する
