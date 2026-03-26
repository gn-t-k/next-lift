# turso パッケージへの diva 導入: 設計判断

## 概要

`packages/turso` に `@praha/diva` を導入する際に生まれた実装パターンレベルの判断を記録する。
アーキテクチャレベルの「diva を使う」という決定は ADR-013 Amendment に記録済み。

## 1. index.ts による公開API境界の分離

### 判断

各 feature の `index.ts` は `withTursoFetch` でのラップと error re-export のみを担い、実装ファイルが `getFetch()` を使った HTTP ロジックを持つ。`Internal` 命名による分離は採用しない。

### 理由

turso の index.ts は provider ラップのワンライナーであり、公開APIと内部実装の間に名前で区別すべきロジックの差がない。ファイルレベルの分離（index.ts vs 実装ファイル）で十部。

### 構造

```
index.ts          → withTursoFetch(() => requestXxx(args)) + error re-export
xxx.ts（実装）     → getFetch() を使った HTTP リクエストロジック
```

## 2. index.ts のエイリアス命名規則

### 判断

実装ファイルからインポートする際、`request` プレフィックスでエイリアスを付ける。

```typescript
import { createDatabase as requestCreateDatabase } from "./create-database";
import { issueToken as requestIssueToken } from "./issue-token";
```

### 理由

- index.ts でエクスポートする関数名（`createDatabase`）と実装関数名が衝突するため、エイリアスが必要
- `request` は「HTTPリクエストを送る」という実装レベルの関心を表し、ラップ前の関数であることが明確になる

## 3. issueToken のオーバーロード配置

### 判断

- 実装ファイル（`issue-token.ts`）: アロー関数 + union 型パラメータでコーディング規約に準拠
- index.ts: `function` キーワードでオーバーロード定義し、公開APIの型安全性を提供

### 理由

- コーディング規約はアロー関数を求めるが、TypeScript のオーバーロードは `function` キーワードが必要
- 実装ファイルは union 型で内部的に分岐を処理し、index.ts が呼び出し側に型安全なオーバーロードを公開する
- `as` キャスト不要で型が自然に通る構造

### コード例

```typescript
// issue-token.ts（実装）
export const issueToken = (
  params:
    | { expiresInDays: null; databaseName: string }
    | { expiresInDays: number; startingFrom: Date; databaseName: string },
) => { ... };

// index.ts（公開API）
export function issueToken(params: {
  expiresInDays: null;
  databaseName: string;
}): R.ResultAsync<{ jwt: string; expiresAt: null }, IssueTokenError>;
export function issueToken(params: {
  expiresInDays: number;
  startingFrom: Date;
  databaseName: string;
}): R.ResultAsync<{ jwt: string; expiresAt: Date }, IssueTokenError>;
export function issueToken(params: ...) {
  return withTursoFetch(() => requestIssueToken(params));
}
```

## 4. テストは実装ファイルを直接 import

### 判断

テストファイルは index.ts ではなく実装ファイルから関数をインポートする。

```typescript
// create-database.test.ts
import { createDatabase } from "./create-database"; // ← create-database.ts
```

### 理由

- index.ts は `withTursoFetch(() => fn(arg))` のワンライナーで、型チェックがカバーする範囲
- テストの関心は HTTP ロジック（リクエスト構築、レスポンス解析、エラーハンドリング）にある
- `helpers/fetch-context.mock.ts` の `mockContext.transient(withFetch, () => mockFetch)` で fetch コンテキストを差し替えてテスト

## 5. get-database の単体テスト不要

### 判断

`get-database.ts` に対する独立したテストファイルは作成しない。

### 理由

- `get-database` は `create-database` の内部関数（409 Conflict 時にのみ呼ばれる）で、他の feature から使われていない
- `create-database.test.ts` の Conflict シナリオで fetch 連鎖モック（`mockResolvedValueOnce` チェーン）により統合的にテストされている
- 使われる箇所が増えたら独立テストを再検討する

## 6. fetch-context.mock.ts の集約配置

### 判断

全 feature の fetch モックヘルパーを `helpers/fetch-context.mock.ts` に集約する。

### 理由

- 全モックが同一の `mockFetch` インスタンス（`vi.fn()`）を共有し、`mockContext.transient(withFetch, () => mockFetch)` でコンテキストに注入する構造
- この共有インスタンスの性質上、feature ごとにファイルを分割するメリットが薄い
- コロケーション原則との緊張はあるが、実用性を優先
- 現在 4 機能・156 行で管理可能。feature 追加時に分割を検討する
