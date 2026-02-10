# コーディング規約

コード変更時に適用するルール。

## コメント

- コードコメントは日本語で記述する（ただし、コードから読み取れない内容のみ）

## 関数宣言

- 関数は`function`キーワードではなく、アロー関数（`const functionName = () => {}`）で記述する
- 例外: `function`キーワードでしか書けない処理（例: ジェネレーター関数）の場合のみ許可

## ファイルとエクスポート

- 基本的に1つのファイルからは1つの関数/コンポーネントをexportする
- ファイル名とexportする関数/コンポーネント名を揃える
  - 例: `router-adapter.tsx` → `export const RouterAdapter`
  - 例: `get-user-data.ts` → `export const getUserData`

## 依存パッケージ

- パッケージのバージョンは `^` や `~` などのレンジ指定を使わず、厳密なバージョン番号を指定する
- Renovateを使用して常に最新の状態を保つ
- 新しいパッケージを追加する際は `pnpm add <package>@<version>` を使用
  - package.jsonを直接編集しない
  - 最新バージョンは `npm view <package-name> version` で確認
