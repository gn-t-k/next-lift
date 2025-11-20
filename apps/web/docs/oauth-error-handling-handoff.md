# OAuth認証エラーハンドリング Phase 2 申し送り書

## Phase 1 完了内容

### 実装済み

- **エラー型定義** (`packages/authentication/src/errors.ts`)
  - `@praha/error-factory`を使用したカスタムエラークラス
  - エラーカテゴリ分類（UserOperationError / ServerError）
  - **Phase 1で使用**: `SessionError`のみ
  - **Phase 2で使用予定**: `OAuthProviderError`, `OAuthCancelledError`, `NetworkError`, `DatabaseError`, `InvalidConfigurationError`
- **Sentry送信ロジック** (`apps/web/src/lib/report-authentication-error.ts`)
  - サーバー系エラーのみSentryに送信
- **Server Actionへの適用** (`apps/web/src/app/dashboard/_actions/sign-out.ts`)
  - `Result.try()`を使用したエラーハンドリング
  - エラー時はSentry送信して`{ error }`を返す（throwしない）

### 設計判断

1. **認証パッケージとアプリケーションの責務分離**
   - `packages/authentication`: エラー型定義のみ（`@praha/error-factory`のみ使用）
   - `apps/web`: エラーハンドリング実装（`@praha/byethrow`を使用）、Sentry送信
   - **重要**: `packages/authentication`は`@praha/byethrow`に依存しない

2. **Server ActionでのResult型の使い方**
   - `redirect()`はthrowするため、`Result`を直接返せない
   - エラー時: `Result.isFailure()`でチェック → Sentry送信 → `{ error }`を返す
   - 成功時: `redirect()`を実行
   - **重要**: `throw`しないことで、ErrorBoundaryではなく`useActionState`でエラーハンドリング可能

3. **エラー型の定義タイミング**
   - Phase 1では`SessionError`のみ使用
   - Phase 2で使用予定のエラーも先行して定義済み
   - Phase 2実装時に追加のエラー型が必要になった場合は追加

## Phase 2 実装手順

### 1. UI側でのエラーハンドリング実装

#### 1.1 エラーメッセージマッピングの作成

`apps/web/src/lib/format-authentication-error.ts` を作成:

```typescript
import type { AuthenticationError } from "@next-lift/authentication/errors";

/**
 * 認証エラーをユーザー向けメッセージに変換
 */
export const formatAuthenticationError = (error: AuthenticationError): string => {
  switch (error.name) {
    case "OAuthProviderError":
      return `${error.provider}での認証に失敗しました。もう一度お試しください。`;
    case "OAuthCancelledError":
      return "認証がキャンセルされました。";
    case "NetworkError":
      return "ネットワークエラーが発生しました。接続を確認してください。";
    case "SessionError":
      return "セッションの処理に失敗しました。もう一度お試しください。";
    case "DatabaseError":
      return "サーバーエラーが発生しました。しばらくしてからお試しください。";
    case "InvalidConfigurationError":
      return "システム設定エラーが発生しました。管理者にお問い合わせください。";
  }
};
```

#### 1.2 エラー表示コンポーネントの作成

`packages/react-components/src/ui/error-alert.tsx` を作成:

```typescript
import type { FC, ReactNode } from "react";

type Props = {
  title?: string;
  message: string;
  onClose?: () => void;
};

export const ErrorAlert: FC<Props> = ({ title = "エラー", message, onClose }) => {
  return (
    <div role="alert" className="error-alert">
      <div className="error-alert-header">
        <span className="error-alert-title">{title}</span>
        {onClose && (
          <button onClick={onClose} type="button" aria-label="閉じる">
            ×
          </button>
        )}
      </div>
      <p className="error-alert-message">{message}</p>
    </div>
  );
};
```

#### 1.3 SignOutButtonの修正

`apps/web/src/app/dashboard/_components/sign-out-button.tsx` を修正:

```typescript
"use client";

import { Button } from "@next-lift/react-components/ui";
import { ErrorAlert } from "@next-lift/react-components/ui";
import { useActionState } from "react";
import { signOut } from "../_actions/sign-out";
import { formatAuthenticationError } from "../../../lib/format-authentication-error";

export const SignOutButton = () => {
  const [state, formAction, isPending] = useActionState(
    signOut,
    { error: null }
  );

  return (
    <div>
      {state.error && (
        <ErrorAlert
          message={formatAuthenticationError(state.error)}
          onClose={() => {/* stateはformActionで管理 */}}
        />
      )}
      <form action={formAction}>
        <Button type="submit" intent="outline" isDisabled={isPending}>
          {isPending ? "ログアウト中..." : "ログアウト"}
        </Button>
      </form>
    </div>
  );
};
```

### 2. Google OAuth認証のServer Action化

現在、Google認証はクライアントサイドで`authClient.signIn.social()`を使用しています。
これをServer Action化してエラーハンドリングを統一します。

#### 2.1 Server Actionの作成

`apps/web/src/app/auth/login/_actions/sign-in-with-google.ts` を作成:

```typescript
"use server";

import type { AuthenticationError } from "@next-lift/authentication/errors";
import { auth } from "@next-lift/authentication/instance";
import {
  OAuthProviderError,
  NetworkError,
} from "@next-lift/authentication/errors";
import { Result } from "@praha/byethrow";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { reportAuthenticationError } from "../../../../lib/report-authentication-error";

type State = { error: AuthenticationError | null };

export const signInWithGoogle = async (
  _prevState: State,
  _formData: FormData,
): Promise<{ error: AuthenticationError | null }> => {
  const signInFn = Result.try({
    try: async (): Promise<void> => {
      await auth.api.signInSocial({
        provider: "google",
        headers: await headers(),
      });
    },
    catch: (error): OAuthProviderError | NetworkError => {
      // Better Authのエラーを分類
      if (error instanceof Error && error.message.includes("network")) {
        return new NetworkError();
      }
      return new OAuthProviderError({
        provider: "google",
        code: error instanceof Error ? error.message : undefined,
      });
    },
  });

  const result = await signInFn();

  if (Result.isFailure(result)) {
    reportAuthenticationError(result.error);
    return { error: result.error };
  }

  redirect("/dashboard");
};
```

#### 2.2 GoogleSignInButtonの修正

`apps/web/src/app/auth/login/_components/google-sign-in-button.tsx` を修正:

```typescript
"use client";

import { Button } from "@next-lift/react-components/ui";
import { ErrorAlert } from "@next-lift/react-components/ui";
import { useActionState } from "react";
import { signInWithGoogle } from "../_actions/sign-in-with-google";
import { formatAuthenticationError } from "../../../../lib/format-authentication-error";

export const GoogleSignInButton = () => {
  const [state, formAction, isPending] = useActionState(
    signInWithGoogle,
    { error: null }
  );

  return (
    <div>
      {state.error && (
        <ErrorAlert
          message={formatAuthenticationError(state.error)}
          onClose={() => {/* stateはformActionで管理 */}}
        />
      )}
      <form action={formAction}>
        <Button type="submit" isDisabled={isPending}>
          {isPending ? "ログイン中..." : "Googleでログイン"}
        </Button>
      </form>
    </div>
  );
};
```

### 3. エラーケースのテスト

以下のエラーケースを手動で確認:

- [ ] ネットワークエラー（Dev Toolsでネットワークをオフライン）
- [ ] サーバーエラー（Better Authのエラーを意図的に発生）
- [ ] セッション期限切れ
- [ ] ユーザーによる認証キャンセル（Google OAuth画面でキャンセル）

## 参考: エラー分類

### ユーザー操作系エラー（UIフィードバックが必要）

| エラー名 | 説明 | 発生条件 |
|---------|------|---------|
| `OAuthProviderError` | OAuthプロバイダーエラー | Google/Appleからエラーが返される |
| `OAuthCancelledError` | ユーザーキャンセル | 認証画面でキャンセルボタンをクリック |

### サーバー系エラー（Sentry送信が必要）

| エラー名 | 説明 | 発生条件 |
|---------|------|---------|
| `NetworkError` | ネットワークエラー | ネットワーク接続の問題 |
| `SessionError` | セッションエラー | セッション作成/取得/削除の失敗 |
| `DatabaseError` | データベースエラー | DB操作の失敗 |
| `InvalidConfigurationError` | 設定エラー | 環境変数未設定など |

## @praha/byethrow ベストプラクティス

### Result.tryの使い方

```typescript
const resultFn = Result.try({
  try: async (): Promise<ReturnType> => {
    // 処理
  },
  catch: (error): CustomError => {
    // エラーを変換
    return new CustomError({ cause: error });
  },
});

const result = await resultFn(); // 関数を実行
```

### エラーハンドリング

```typescript
if (Result.isFailure(result)) {
  // result.error に型安全にアクセス可能
  reportAuthenticationError(result.error);
  return { error: result.error };  // Server ActionではErrorをreturn
}

// 成功時（redirectはthrowするため、returnは不要）
redirect("/dashboard");
```

### パイプライン処理（将来的に使用可能）

```typescript
const result = await Result.pipe(
  Result.succeed(input),
  Result.andThen(validate),
  Result.andThen(process),
  Result.andThen(save),
);
```

## 注意事項

1. **Server Actionとredirect**
   - `redirect()`はエラーをthrowするため、`Result`を直接返せない
   - エラー時は`{ error }`を返す（`throw`しない）、成功時は`redirect()`を実行
   - ErrorBoundaryではなく`useActionState`でエラーをハンドリングする設計

2. **型安全性**
   - `Result.try()`の`try`と`catch`に明示的な型を指定
   - エラー型は`AuthenticationError`のユニオン型

3. **エラーメッセージ**
   - エラー型定義にはメッセージを含めない（UI側の責務）
   - `formatAuthenticationError()`で変換

4. **Sentry送信**
   - `isServerError()`でサーバー系エラーのみ送信
   - ユーザー操作系エラーは送信しない
