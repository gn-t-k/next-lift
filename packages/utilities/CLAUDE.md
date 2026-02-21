# packages/utilities

汎用ユーティリティ関数を提供するパッケージ。

## 機能

| 提供機能 | 説明 |
| --- | --- |
| 遅延初期化Proxy | `./create-lazy-proxy` からimport |
| nanoidベースのID生成 | `./generate-id` からimport |
| リトライ処理 | `./with-retry` からimport。指数バックオフ |

## 使い方

### 遅延初期化Proxy

```typescript
import { createLazyProxy } from "@next-lift/utilities/create-lazy-proxy";

// モジュール読込時ではなく、プロパティアクセス時に初期化を実行する
const proxy = createLazyProxy(() => expensiveInitialization());
```

### ID生成

```typescript
import { generateId } from "@next-lift/utilities/generate-id";

const id = generateId(); // nanoidベースのユニークID
```

### リトライ処理

```typescript
import { withRetry } from "@next-lift/utilities/with-retry";

const result = await withRetry(
  () => fetchData(),
  { maxRetries: 3 }
);
```

## 開発ガイド

### 関数の追加基準

- 複数のパッケージ・アプリから利用される汎用的な処理であること
- ドメイン（筋トレ）に依存しないこと
- 1つのパッケージでしか使わない関数は、そのパッケージ内に置く
