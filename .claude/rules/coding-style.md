# コーディング規約

コード変更時に適用するルール。

## コードを説明する情報

- 実装の仕様はテストコードに書く
- 変更の理由はコミットメッセージに書く
- 以下の事情がある場合のみ、コードコメントを書く
  - 実装から自明ではない事情がある場合
  - 長大な関数・複雑な実装（状態管理、暗黙的な依存など）で、コメントがコードリーディングを助ける場合
    - ただし、まずはコードのリファクタを優先する
- コメントと実装の内容が乖離する可能性があるため、コメントは極力書かない
- コメントを書く場合は日本語で記述する
- コメントは1行で書く。改行はユーザーが必要と判断したら自分で入れる（先回りで改行しない）

## 関数宣言

- 関数は `function` キーワードではなく、アロー関数（`const functionName = () => {}`）で記述する
- 例外: `function` キーワードでしか書けない処理（例: ジェネレーター関数）の場合のみ許可

## ファイルとエクスポート

- 基本的に1つのファイルからは1つの関数/コンポーネントを export する
- ファイル名と export する関数/コンポーネント名を揃える
  - 例: `router-adapter.tsx` → `export const RouterAdapter`
  - 例: `get-user-data.ts` → `export const getUserData`
  - 例: `use-foo.ts` → `export const useFoo`
- カスタム hook は単体なら 1 ファイル（`use-foo.ts`）。純関数・test など sibling が必要なときだけ `use-foo/index.ts` にディレクトリ化する

## ファイル内の構造（トップダウン）

- ファイル先頭に近い位置に `export default` / `export const` を置く
- internal な helper 関数・データ・型定義は同ファイル下部にまとめる
- 互いに参照する関数・型・オブジェクトは段落ごとにまとめてコロケーションする
- アロー関数の `const` 宣言は TDZ があるため、`export default` の値構築に必要な依存（例: `meta.component = FlowDemo` の `FlowDemo`）は `export default` より前に書く必要がある。一方、関数本体内で参照する識別子は遅延評価なので後方参照可

**Why:** 公開 API が最初に目に入り、詳細実装が後ろに来る構造のほうが読み解きやすい。

## 設計の単位は責務で決める

### 状態は論理状態数で型を作る

boolean を複数並べる前に取り得る状態数を数える。表現できるが論理的に起こり得ない組み合わせがあるなら、文字列リテラルのユニオンで表現する。

```ts
// ❌ 4通り表現できるが、論理的には3状態しかない
type CreateState = { isDuplicate: boolean; isDisabled: boolean };
// → { isDuplicate: true; isDisabled: false } は「重複なのに押せる」で論理破綻

// ✅ 文字列リテラルユニオンで3状態を明示
type CreateState = "empty" | "duplicate" | "creatable";
```

不正な組み合わせを型レベルで表現不能にする。

### optional/nullable は required をデフォルトにする

プロパティ・引数・フィールドを optional（`?:`）や nullable にする前に、未指定 / null になるドメイン上の事情が実在するか確認する。実在しないなら required をデフォルトにする。

- 理由なき optional は「無意味な未指定状態」を表現可能にし、degrade 分岐（未指定時のフォールバック）を呼び込む
- 機能未実装などの時間的・段取りの都合を、恒久的な API の optional 性に持ち込まない。未実装の穴はプレースホルダ注入など呼び出し側で吸収する

```ts
// ❌ 機能未実装という段取りの都合で optional にする
type Props = { renderExerciseProgress?: () => ReactNode };
// → 未実装の都合が型に漏れ、未指定時の degrade 分岐が必要になる

// ✅ ドメイン上 consumer が必ず提供するなら required
type Props = { renderExerciseProgress: () => ReactNode };
// 未実装期間は呼び出し側でプレースホルダを注入して吸収する

// ❌ 常に存在する UI スロットなのに optional（キー省略が型上合法になる）
type PanelProps = { caption?: string | undefined };

// ✅ スロットは常にある。空なら undefined を渡す
type PanelProps = { caption: string | undefined };
```

**Why:** 既存の「状態は論理状態数で型を作る」と同根。理由なき optional は論理的に起こり得ない「未指定」状態を型で表現可能にしてしまい、不正な状態を型レベルで排除する原則に反する。exactOptionalPropertyTypes 環境では、不要な optional をやめれば `?: T | undefined` の冗長さも消える。

**How to apply:** optional / nullable を付ける前に「これが未指定 / null になるドメイン上の事情は何か」を1つ挙げられるか自問する。挙げられないなら required にする。

### 関数は処理の流れで分ける

- 分岐後の処理が独立した責務（成功/失敗、create/update など）なら、振る舞いごとに別関数として呼び出し元で分岐する
- 同じ処理の流れを通り、違いはデータの形だけなら、discriminated union を1つの関数で受ける

```ts
// ❌ フラグで内部分岐
const fakeFetch = (delayMs: number, shouldFail: boolean) => { ... };

// ✅ 振る舞いごとに別関数
const fakeFetchSuccess = (delayMs: number) => { ... };
const fakeFetchFailure = (delayMs: number) => { ... };

// 呼び出し元で分岐
const promise = outcome === "success" ? fakeFetchSuccess(delayMs) : fakeFetchFailure(delayMs);
```

**Why:** 形（フラグ・boolean 数・union の枝数）を見て分けると、責務が同じものを過剰分割したり、責務が違うものを無理にまとめたりして、いずれも保守コストが上がる。

**How to apply:** 「分岐管理の責務」と「特定の処理をする責務」が別物だと意識する。分岐後の処理が同じ流れなら分岐管理の責務は存在せず、1つの関数で discriminated union を受ければよい。違う流れなら、分岐管理を呼び出し元に、特定処理を個別の関数に分ける。

## 型キャスト（as）を安易に使わない

- 型推論が複雑で `as` キャストが必要になった場合、「推論が複雑だから」は as を使う正当な理由にならない
- 設計や実装のアプローチを変えてキャストなしで型が通る方法を探す

**Why:** as キャストは型の不整合を隠し、型安全性を壊す。根本原因に向き合わないと、将来的に型エラーを見逃すリスクがある。

**How to apply:** `as` を検討する前に、関数の構造変更、別 API の使用、型パラメータの変更等で型が自然に通る方法を探す。

## 移行コストだけを理由に古い技術を使い続けない

- 旧世代になった技術スタック（旧プロトコル・非推奨ライブラリ等）の置き換え判断で、移行コストの大小を主な却下理由にしない
- 技術的な制約（新しいパッケージで実現不可能な機能がある等）が見つかったときだけ、その制約を明示して旧採用維持を提案する

**Why:** 古いものを使い続けると、(1) 性能・保守性で不利、(2) コミュニティ・公式サポートが先に枯れる、(3) いずれ強制移行になるなら早いほうが累積コストが低い。

**How to apply:** 「Auth DB はリモート直接アクセスだけだから旧 client のままでいい」「テスト用インメモリだから移行不要」など、用途が限定的だからという理由で旧採用を維持する提案はしない。

## 依存パッケージ

- パッケージのバージョンは `^` や `~` などのレンジ指定を使わず、厳密なバージョン番号を指定する
- Renovate を使用して常に最新の状態を保つ
- 新しいパッケージを追加する際は `pnpm add <package>@<version>` を使用
  - package.json を直接編集しない
  - 最新バージョンは `npm view <package-name> version` で確認
