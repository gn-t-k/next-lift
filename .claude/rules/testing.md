# テスト開発ルール

テストコードを書く際に適用するルール。

## テスト粒度

- テストコードも保守対象なので、数は最小限に留める
- 単体テスト: 状態管理が複雑、または処理の分岐が多い場合のみ
- 統合テスト: それ以外のケース（基本はこちらを優先）

## テスト構造

- describe/testの3階層構造: 機能名 → シナリオ分類 → 具体的なテスト
- describe/testは日本語で記述
- testは「〜こと」の形式で振る舞いを記述

## モックパターン

### mockファイルの作成基準

- **mockファイルを作る**: モジュールからエクスポートされた関数（依存先）を差し替える場合
  - 例: `create-database.mock.ts` で `createDatabase` をスパイ
- **インライン `vi.fn()`**: テスト対象に渡すコールバックや引数の場合、またはグローバルAPI（`globalThis.fetch`）を差し替える場合
  - 例: `vi.fn().mockResolvedValue("success")` をテスト対象の引数に渡す
  - 例: `globalThis.fetch = vi.fn()` でfetchを差し替え

### mockファイルの構造

```ts
import * as module from "./実装ファイル";

export const mockXxxOk = (overrides?: Partial<成功時の型>) => {
  return vi.spyOn(module, "関数名").mockResolvedValue(
    R.succeed({ ...デフォルト値, ...overrides }),
  );
};

export const mockXxxError = (error: エラー型) => {
  return vi.spyOn(module, "関数名").mockResolvedValue(R.fail(error));
};
```

- `import * as module` でモジュール全体をインポートし、`vi.spyOn(module, "関数名")` で差し替える
- `mockXxxOk` は `overrides` 引数でデフォルト値を部分上書き可能にする
- `mockXxxError` は具体的なエラー型を引数に取る
- スパイオブジェクトを `return` する（テスト側で呼び出し引数を検証できるように）

### 命名規則

- 成功: `mockXxxOk`、失敗: `mockXxxError`
- `Xxx` はモック対象の関数名に対応させる（例: `createDatabase` → `mockCreateDatabaseOk`）

### モックのセットアップ位置

- `describe` のすぐ下の `beforeEach` でモックをセットアップする
- `describe` にシナリオの条件（前提）、`test` に期待値（検証）を書く構造になるため、テストの追加が容易になる

```ts
describe("トークン発行に失敗したとき", () => {
  // describe = 条件 → beforeEachでその条件を再現
  beforeEach(() => {
    mockCreateDatabaseOk();
    mockIssueTokenError(new IssueTokenError());
  });

  // test = 期待値のみ → テスト追加時はtestブロックを足すだけ
  test("エラーが返されること", async () => { ... });
});
```

### テストでのスパイ利用

- 呼び出し引数を検証する場合: `let spy: ReturnType<typeof mockXxxOk>` で型付けし、`beforeEach` で代入してテストで参照する
- 結果のみ検証する場合: `beforeEach` で `mockXxxOk()` を呼ぶだけでスパイ参照は不要

```ts
// 呼び出し引数を検証するパターン
let createDatabaseSpy: ReturnType<typeof mockCreateDatabaseOk>;
beforeEach(() => {
  createDatabaseSpy = mockCreateDatabaseOk({ name: "test-db" });
});
test("...", async () => {
  expect(createDatabaseSpy).toHaveBeenCalledWith("test-db");
});

// 結果のみ検証するパターン
beforeEach(() => {
  mockCreateDatabaseOk();
  mockIssueTokenError(new IssueTokenError());
});
```

### パッケージ間のモック共有

- パッケージ内の `testing/index.ts` からmock関数を再エクスポートする
- 利用側は `@next-lift/xxx/testing` でインポートする
- `package.json` の `exports` に `"./testing"` エントリを定義する

## テストデータ生成

- `@praha/drizzle-factory` を使用
- `testing/factories/` ディレクトリにファクトリを配置

## 統合テストのセットアップ

- `testing/setup.ts` でインメモリDBとグローバルセットアップを定義
- `vi.hoisted()` でモック前にDBを初期化
- `beforeEach` でテーブルをクリーンアップしマイグレーション実行

## ファイル配置

- テストファイル: 実装と同ディレクトリに `{機能名}.test.ts`
- モックファイル: 同ディレクトリに `{機能名}.mock.ts`
- ファクトリ: `testing/factories/`
- セットアップ: `testing/setup.ts`

## 参考実装

- `packages/authentication/` - 統合テストとモックパターン
- `packages/per-user-database/` - ファクトリとセットアップ
