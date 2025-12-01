# ADR-018: Sentryエラーレポーティング規約

## ステータス

Accepted

## コンテキスト

Next Liftでは、Sentryを使用してエラー監視を行う。
サーバーサイドで発生したエラーをSentryに送信し、運用中の問題を検知・分析できるようにする必要がある。

## 決定内容

### 1. シンプルな送信

エラー送信は`Sentry.captureException(error)`のみで行う。
タグやコンテキストは、必要になるまで追加しない。

```typescript
catch: (error) => {
  const signInError = new SignInWithGoogleError({ cause: error });
  Sentry.captureException(signInError);
  return signInError;
}
```

### 2. エラー定義のコロケーション

エラークラスは発生場所に定義する（中央管理しない）。

```typescript
// apps/web/src/app/auth/sign-in/_mutations/sign-in-with-google.ts
class SignInWithGoogleError extends ErrorFactory({
  name: "SignInWithGoogleError",
  message: "Sign in with Google failed",
}) {}
```

### 3. 命名規則（将来タグを使う場合）

タグやコンテキストを追加する場合は、以下の規則に従う:

- タグキー: `snake_case`（例: `error_type`, `component`）
- コンテキストキー: `snake_case`
- コンテキスト内属性: `camelCase`

## 理由

1. **Sentryの自動情報**: environment, release, transactionなどは自動付与される
2. **エラー名で識別可能**: エラークラス名自体が識別子として機能する
3. **YAGNI**: タグが必要になったら追加すればよい

## 結果・影響

- シンプルで保守しやすい
- 必要に応じて後からタグを追加できる
- 過剰な抽象化を避けられる

## 決定日

2025年12月2日
