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

## Client Componentの設計

### 設計原則

- **ページ全体を`"use client"`にしない**
  - インタラクティブな部分（イベントハンドラー、状態管理）のみをClient Componentに分離
  - 静的コンテンツはServer Componentのまま保つ

- **Client Componentは可能な限り「葉」の位置に配置**
  - コンポーネントツリーの下層にClient Componentを配置することで、クライアントバンドルサイズを最小化

- **Composition Patternの活用**
  - Server ComponentをClient Componentの`children`として渡すことで、静的コンテンツをサーバーでレンダリング
  - Client Componentはインタラクティブな機能のみを担当
  - 詳細: [Composition Pattern](https://zenn.dev/akfm/books/nextjs-basic-principle/viewer/part_2_composition_pattern)

### 実装例

```tsx
// ❌ 悪い例: ページ全体がClient Component
"use client";

export default function Page() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <main>
      <h1>タイトル</h1>  {/* 静的だがクライアントバンドルに含まれる */}
      <button onClick={() => setIsOpen(!isOpen)}>開く</button>
      {isOpen && <Modal />}
    </main>
  );
}

// ✅ 良い例: インタラクティブな部分のみClient Component
export default function Page() {
  return (
    <main>
      <h1>タイトル</h1>  {/* Server Componentとしてレンダリング */}
      <ModalButton />     {/* Client Component */}
    </main>
  );
}

// _components/modal-button.tsx
"use client";

export const ModalButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(!isOpen)}>開く</button>
      {isOpen && <Modal />}
    </>
  );
};
```

### 非同期処理のpending状態管理

#### Server Actionの場合: `useActionState`

フォーム送信でServer Actionを使う場合は`useActionState`を使用する。

```tsx
"use client";

import { useActionState } from "react";
import { submitForm } from "../_actions/submit-form";

export const SubmitButton = () => {
  const [state, formAction, isPending] = useActionState(submitForm, undefined);

  return (
    <form action={formAction}>
      <Button type="submit" isDisabled={isPending}>
        {isPending ? "送信中..." : "送信"}
      </Button>
    </form>
  );
};
```

#### クライアント側の非同期処理の場合: `useTransition`

OAuth認証やAPIコールなど、ボタンクリックで非同期処理を行う場合は`useTransition`を使用する。

**理由:**

- React 19の公式推奨パターン
- pending状態が自動管理される（`finally`句不要）
- エラー発生時も自動的にpending状態が解除される

```tsx
"use client";

import { useTransition } from "react";
import { authClient } from "../../../../lib/auth-client";

export const GoogleSignInButton = () => {
  const [isPending, startTransition] = useTransition();

  const handleGoogleSignIn = () => {
    startTransition(async () => {
      try {
        await authClient.signIn.social({ provider: "google" });
      } catch (error) {
        console.error("Google sign in failed:", error);
        // エラー表示処理
      }
    });
  };

  return (
    <Button onClick={handleGoogleSignIn} isDisabled={isPending}>
      {isPending ? "ログイン中..." : "Googleでログイン"}
    </Button>
  );
};
```

**❌ 避けるべきパターン: `useState`での手動管理**

```tsx
// useState + try/catchは手動管理が必要でエラーが起きやすい
const [isPending, setIsPending] = useState(false);

const handleClick = async () => {
  setIsPending(true);
  try {
    await someAsyncFunction();
  } catch (error) {
    // エラー処理
  } finally {
    setIsPending(false); // 忘れるとUIがフリーズ
  }
};
```
