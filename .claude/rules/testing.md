# テスト開発ルール

テストコードを書く際に適用するルール。

## テスト粒度

- テストコードも保守対象なので、数は最小限に留める
- 単体テスト: 状態管理が複雑、または処理の分岐が多い場合のみ
- 統合テスト: それ以外のケース（基本はこちらを優先）

## テストしないもの

### DB の宣言的挙動

- DB スキーマで宣言した DEFAULT / CHECK / NOT NULL の挙動は、アプリ側のテストで再検証しない
- これらは SQLite / Drizzle の機能であり、テスト対象は「自分たちのアプリロジック」ではない
- 手動修正したマイグレーションの回帰ガードが本当に欲しければ、`apply-migrations.test.ts` のような既存の migration smoke test に1行足す形に留める。新規テストファイルを起こさない

**Why:** スキーマ宣言と二重管理になり、保守コストだけが増える。

## ロジックテストと UI テストの責務分担

- 純粋関数の分岐網羅は単体テスト（filter / 状態判定 / リスト構築など）
- Storybook の play 関数は **UI 経路と状態遷移パスの検証** に絞る（open → search → select、ドロワー閉じてフォーカス戻る、など）
- 同じロジック分岐を unit と Storybook の両方で確認しない（重複検証）

**例:**
- `filterByName(items, query)` の分岐網羅 → `filter-by-name.test.ts`
- 「open → 検索 → option 選択 → onSelect 呼ばれる」 → Storybook play
- 「重複時に create が disabled」のような文言・属性の確認 → unit でカバー済みなら Storybook では削る

## テスト構造

- describe/testの3階層構造: 機能名 → シナリオ分類 → 具体的なテスト
- describe/testは日本語で記述
- testは「〜こと」の形式で振る舞いを記述
- セットアップ（モック・DB接続・テストデータ生成・状態系を含む）は `beforeEach` に切り出す。`test` 関数は振る舞いの検証のみに絞り、open/close などのセットアップを含まない

## モックパターン

### mockファイルの作成基準

- **mockファイルを作る**: モジュールからエクスポートされた関数（依存先）を差し替える場合
  - 例: `create-database.mock.ts` で `createDatabase` をスパイ
- **インライン `vi.fn()`**: テスト対象に渡すコールバックや引数の場合
  - 例: `vi.fn().mockResolvedValue("success")` をテスト対象の引数に渡す
- **diva の `mockContext`**: `@praha/diva` のコンテキスト経由で注入される依存（fetchなど）を差し替える場合
  - `mockContext.transient(withXxx, () => mockFn)` でコンテキストにモックを登録
  - 例: `fetch-context.mock.ts` で `mockContext.transient(withFetch, () => mockFetch)` を定義し、各テストで `mockFetch.mockResolvedValue(...)` を呼ぶ

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
- `packages/turso/` - divaによるfetchモックパターン
