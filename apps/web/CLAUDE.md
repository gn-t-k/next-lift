# apps/web開発ガイド

このファイルは、apps/webディレクトリで作業する際のガイダンスです。

## ファイル整理

- ページで使用される関数や定数は、同ディレクトリ内にプレフィックス`_`をつけたディレクトリを作成して整理する
  - クエリ関数（データ取得）: `_queries/` ディレクトリに配置
  - ミューテーション関数（データ変更・副作用のある操作）: `_mutations/` ディレクトリに配置
  - UIコンポーネント: `_components/` ディレクトリに配置
  - 定数: `_constants/` ディレクトリに配置
- ファイル名はケバブケース（kebab-case）を使用
- コロケーション原則
  - データ取得関数とその戻り値の型は同じファイルに配置
  - コンポーネントとそのfallback/skeletonコンポーネントは同じファイルに配置

## キャッシュ設定の配置パターン

### 基本原則

- **キャッシュ設定はコンポーネント側に配置**
  - `"use cache"`, `cacheLife()`, `cacheTag()` などの設定は `_components/` 内のコンポーネントファイルで行う
  - キャッシュ設定はUI要件と密接に関連するため、コンポーネントとコロケーションさせる

- **純粋なビジネスロジックはクエリ側に配置**
  - データ取得ロジックのみを `_queries/` に配置
  - キャッシュ設定を含めず、テスト可能な純粋関数として実装

### 実装パターン

```typescript
// _queries/get-user.ts (純粋なロジックのみ)
export const getUser = async (id: string) => {
  // ビジネスロジックのみ
  return { id, name: "..." };
};

// _components/user-profile.tsx (キャッシュ設定)
const getUserCache = async (id: string) => {
  "use cache";
  cacheLife("hours");
  return getUser(id);
};

export const UserProfile: FC<Props> = async ({ id }) => {
  const user = await getUserCache(id);
  // UI rendering
};
```

### 例外的なケース

以下のケースではパターンが異なる場合がある:

1. **ネストしたキャッシュ**: キャッシュされた関数が別のキャッシュされた関数を呼ぶ場合、`_queries/`にキャッシュ設定を配置することがある（例: 08-nested-cache）
2. **Route Handlers**: Route Handler内でキャッシュ設定を行う（例: 09-route-handlers）
3. **Private Cache**: `cookies()`や`headers()`を使用する場合、コンポーネント内で`"use cache: private"`を設定

### 重複について

同じクエリ関数を複数のコンポーネントで使用する場合でも、各コンポーネントで独自のキャッシュラッパー関数を定義する。キャッシュ設定の重複は許容される。

## セマンティックHTML要素

- レイアウトのための要素は、役割に応じて適切なセマンティック要素を使用する
  - **`<main>`**: ページのメインコンテンツコンテナー
  - **`<header>`**: ページタイトルと説明文などのヘッダーセクション
  - **`<section>`**: 大きな意味的まとまり（必要に応じて）
  - **`<time>`**: 日付や時間を表示する要素
    - `datetime`属性で機械可読な形式（ISO 8601等）を指定
    - 例: `<time dateTime={timestamp}>{new Date(timestamp).toLocaleString()}</time>`
  - **`<div>`**: 純粋にレイアウト目的のみの要素
- アクセシビリティとSEOを考慮した要素選択を優先

## 余白の実装

- 要素間の余白は親要素で一括管理する
  - 通常フロー: `space-y-*` / `space-x-*` を使用
  - Flexbox/Grid: `gap-y-*` / `gap-x-*` / `gap-*` を使用
- 個別要素への`margin`指定は避け、親要素で余白を制御する

## 命名規則

- ファイル名はケバブケース（kebab-case）を使用
- 関数名、変数名はキャメルケース（camelCase）を使用
- コンポーネント名はパスカルケース（PascalCase）を使用
- exportしない関数やexport defaultする関数など、外部から参照されないものは極力シンプルな命名にする
  - 例: `export default Page`, `export default Layout`
