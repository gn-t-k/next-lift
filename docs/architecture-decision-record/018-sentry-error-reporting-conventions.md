# ADR-018: Sentryエラーレポーティング規約

## ステータス

Accepted

## コンテキスト

Next Liftでは、Sentryを使用してエラー監視を行っています。認証エラーのレポーティング実装中に、以下の設計上の疑問が生じました:

1. **命名規則**: タグやコンテキストのキー名にsnake_caseとcamelCaseのどちらを使うべきか
2. **組織化**: エラーレポーティングのコードをどう構造化すべきか
3. **一貫性**: アプリケーション全体でタグ/コンテキスト構造をどう統一すべきか

これらの疑問に答えるため、Sentry公式ドキュメント、ベストプラクティス、実際のプロジェクト事例を調査し、Next Liftに最適な規約を確立する必要がありました。

## 決定内容

### 1. 命名規則

#### タグキー

- **`lower_snake_case`を使用する**
- 例: `error_type`, `component`, `auth_provider`, `user_role`

#### コンテキストキー

- **`lower_snake_case`を使用する**（タグと統一）
- 例: `authentication_error`, `database_details`, `api_request`

#### コンテキスト内の属性

- **`camelCase`を使用する**（JavaScript/TypeScript慣習に従う）
- 例:

  ```typescript
  contexts: {
    authentication_error: {  // コンテキストキーはsnake_case
      userId: "123",         // 属性はcamelCase
      sessionId: "abc",
      errorMessage: "...",
    }
  }
  ```

### 2. Next Lift標準タグセットの中央管理

`apps/web/src/lib/sentry/standard-tags.ts`でNext Lift標準タグキーを定義:

```typescript
export const StandardTags = {
  // WHAT（何を）
  ERROR_TYPE: "error_type",
  ERROR_NAME: "error_name",
  COMPONENT: "component",
  OPERATION: "operation",

  // WHO（誰が）
  USER_ROLE: "user_role",
  ACCOUNT_TIER: "account_tier",
} as const;
```

### 3. タグとコンテキストの使い分け

#### タグ（低カーディナリティ）

- **用途**: フィルタリング、検索、ダッシュボード集計、アラート
- **特徴**: Sentryでインデックス化される
- **カーディナリティ**: 低（ユニーク値が100未満/日が目安）
- **例**: `error_type`, `component`, `user_role`, `environment`

#### コンテキスト（高カーディナリティOK）

- **用途**: 個別イベントの詳細デバッグ
- **特徴**: インデックス化されない
- **カーディナリティ**: 高くてもOK（UUID、タイムスタンプなど）
- **例**: リクエストボディ、APIレスポンス、詳細なスタックトレース

### 4. エラーレポーティング関数の実装パターン

```typescript
import { StandardTags } from "./sentry/standard-tags";
import * as Sentry from "@sentry/nextjs";

export const reportAuthenticationError = (error: AuthenticationError): void => {
  if (!isServerError(error)) {
    return;
  }

  Sentry.captureException(error, {
    tags: {
      [StandardTags.ERROR_TYPE]: "authentication",
      [StandardTags.COMPONENT]: "authentication",
      [StandardTags.ERROR_NAME]: error.name,
    },
    contexts: {
      authentication_error: {
        name: error.name,
        message: error.message,
        cause: error.cause ? String(error.cause) : undefined,
      },
    },
  });
};
```

## 理由

### 1. snake_caseの採用理由

#### Sentry公式の暗黙的推奨

- 公式ドキュメントの例では一貫してsnake_caseが使用されている
- 許可文字: `a-z`, `A-Z`, `0-9`, `_`, `.`, `:`, `-`（スペース不可）

#### 大文字小文字の重複回避

- `userId`と`userid`が異なるタグとして扱われる問題を防ぐ
- snake_caseなら`user_id`で統一され、曖昧性がない

#### 可読性

- Sentry UI（Discover、Issuesサイドバー）でカラム表示する際に読みやすい
- `error_type`は`errorType`より視認性が高い

#### 互換性

- snake_caseはすべての許可文字と互換性がある
- 将来的にピリオドやコロンを使う場合も一貫性を保てる

### 2. コンテキスト内属性でcamelCaseを許容する理由

- JavaScriptオブジェクトとして自然
- 既存のコードベース（TypeScript）と一貫性がある
- Sentryのコンテキストは検索対象外なので、命名規則の厳密性は低い

### 3. 中央管理の利点

- アプリケーション全体で一貫したタグ構造
- タグキーの重複を防止（typo対策）
- Sentryでの検索・フィルタリングが容易
- 新しいエンジニアがタグ構造を理解しやすい

## 代替案

### 代替案1: 全体をcamelCaseに統一

**内容**: タグキー、コンテキストキー、属性すべてをcamelCaseにする

**メリット**:

- JavaScriptコードベースと完全に一貫
- TypeScriptの型定義が自然

**デメリット**:

- Sentry公式推奨と異なる
- 大文字小文字の重複リスク
- Sentry UIでの可読性が低い

**判断**: 却下（Sentryエコシステムとの整合性を優先）

### 代替案2: 関数ごとにad-hoc定義

**内容**: エラーレポーティング関数ごとにタグ/コンテキスト構造を自由に定義

**メリット**:

- 柔軟性が高い
- コンテキストに応じた最適化が可能

**デメリット**:

- 一貫性が保てない
- Sentryでの横断的な検索が困難
- コードレビューで見落としやすい

**判断**: 却下（一貫性とメンテナンス性を優先）

### 代替案3: すべてをsnake_caseに統一

**内容**: コンテキスト内属性もsnake_caseにする

**メリット**:

- 完全な一貫性
- Sentry側の命名規則と完全一致

**デメリット**:

- JavaScriptコードベースと不一致
- TypeScriptの型定義が不自然（`{ user_id: string }`）
- 既存コードとの統合が困難

**判断**: 却下（コンテキストは検索対象外なので、柔軟性を優先）

## 結果・影響

### ポジティブな影響

1. **一貫性の確保**: 全エンジニアが同じ規約に従うことで、Sentryの利用効率が向上
2. **検索性の向上**: 標準タグにより、横断的なエラー分析が容易
3. **保守性の向上**: 中央管理により、タグ構造の変更が容易
4. **オンボーディング**: 新しいエンジニアが規約を理解しやすい

### 注意が必要な点

1. **既存コードとの整合性**: 既存のSentryタグ（存在する場合）をこの規約に合わせて移行する必要がある
2. **学習コスト**: snake_caseとcamelCaseの使い分けを理解する必要がある
3. **Sentryクエリの更新**: タグ構造を変更した場合、既存のダッシュボード/アラートを更新する必要がある

### 今後の拡張性

この規約は以下の将来的な拡張を想定しています:

- データベースエラーのレポーティング
- APIエラーのレポーティング
- パフォーマンス監視のタグ付け
- カスタムダッシュボードの構築

## 関連する決定

- [ADR-003: Better Auth](./003-better-auth.md) - 認証システムの選定
- [ADR-002: Next.js (Web App + API)](./002-nextjs-for-web-and-api.md) - Webフレームワークの選定

## 参考資料

- [Sentry Documentation: Tags](https://docs.sentry.io/platforms/javascript/enriching-events/tags/)
- [Sentry Documentation: Context](https://docs.sentry.io/platforms/javascript/enriching-events/context/)
- [Sentry Best Practices: Searchable Properties](https://docs.sentry.io/concepts/search/searchable-properties/)

## 決定日

2025年11月20日
