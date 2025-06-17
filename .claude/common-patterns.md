# 共通パターン・テンプレート

## よく使うコマンドパターン

### Git操作

#### ブランチ作成とプルリクエスト

```bash
# フィーチャーブランチ作成
git checkout -b {type}/{description}

# 変更をコミット
git add .
git commit -m "{理由}のため、{変更内容}を実装"

# リモートにプッシュ
git push -u origin {branch-name}

# プルリクエスト作成（テンプレートを使用）
gh pr create --title "{タイトル}"
```

#### mainブランチで間違ってコミットした場合の修正

```bash
# 新しいブランチを作成（コミットを保持）
git checkout -b {type}/{description}

# mainブランチに戻る
git checkout main

# コミットを取り消し（変更はステージに残す）
git reset --soft HEAD~1

# 変更をアンステージ
git restore --staged .

# フィーチャーブランチに戻る
git checkout {type}/{description}

# 変更を再度ステージ・コミット
git add .
git commit -m "{コミットメッセージ}"
```

### pnpm操作

#### パッケージのインストール・ビルド

```bash
# 依存関係のインストール
pnpm install

# 全体ビルド
pnpm build

# 特定パッケージのビルド
pnpm --filter {package-name} build

# Lintチェック
pnpm lint

# 型チェック
pnpm typecheck
```

### モノレポ管理

#### 新しいパッケージの追加

```bash
# ワークスペースに新しいパッケージディレクトリを作成
mkdir -p {apps|packages|configs}/{package-name}

# package.jsonを作成
# pnpm-workspace.yamlを更新（必要に応じて）
# turbo.jsonを更新（必要に応じて）
```

## コミットメッセージテンプレート

### 基本形式

```text
{理由}のため、{変更内容}を実装

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

### 種類別例

#### 新機能追加

```text
ユーザー認証機能が必要なため、Better Authの基本設定を追加
```

#### バグ修正

```text
CI Lintエラーが発生するため、turbo.jsonの依存関係を修正
```

#### リファクタリング

```text
コードの可読性向上のため、ESLint設定を統一
```

#### インフラ・環境改善

```text
モノレポ環境とCIのツール設定基盤整備のため、共通設定パッケージとVSCode設定を追加
```

#### ドキュメント更新

```text
プロジェクト知識の体系化のため、.claudeディレクトリ構造を導入
```

## プルリクエストテンプレート

`.github/pull_request_template.md`を参照する。

### 重要な注意事項

- **必須**: `gh pr create`では`--body`オプションを使わない
- テンプレートが自動適用されるため、独自のbody内容で上書きしない
- CLAUDE.mdの指示に従い、テンプレートをベースにして作成する

## Markdownリント一括修正パターン

### 効率的な一括修正コマンド

```bash
# プロジェクト全体のMarkdownファイルを一括で修正
pnpm lint:fix

# または、markdownlintを直接実行（修正可能なエラーを自動修正）
markdownlint --fix **/*.md

# 手動修正が必要なエラーの確認
pnpm lint
```

### よくあるMarkdownlintエラーの修正パターン

#### MD031 (blanks around fences)

```markdown
<!-- 修正前 -->
説明文

```code
内容
```

次の文

<!-- 修正後 -->
説明文

```code
内容
```

次の文

```text

#### MD040 (fenced code language)

```markdown
<!-- 修正前 -->

```text
コード内容
```

<!-- 修正後 -->

```text
コード内容
```

```text

#### MD022 (blanks around headings)

```markdown
<!-- 修正前 -->
前の文
## 見出し
次の文

<!-- 修正後 -->
前の文

## 見出し

次の文
```

#### MD032 (blanks around lists)

```markdown
<!-- 修正前 -->
前の文
- リスト項目1
- リスト項目2
次の文

<!-- 修正後 -->
前の文

- リスト項目1
- リスト項目2

次の文
```

#### MD047 (single trailing newline)

```bash
# ファイル末尾に改行を追加
echo "" >> ファイル名.md
```

### 日本語校正エラーの修正パターン

#### jtf-style/3.3 (かっこの前後の空白)

```markdown
<!-- 修正前 -->
「今回だけじゃなくて今後も同じっぽい」

<!-- 修正後 -->
今回だけでなく今後も同様の
```

### 一括修正の手順

1. **自動修正可能なエラーを処理**:

   ```bash
   markdownlint --fix **/*.md
   ```

2. **残りのエラーを確認**:

   ```bash
   pnpm lint
   ```

3. **手動修正が必要なエラーを処理**:
   - MD031, MD022, MD032: 空行の追加・削除
   - MD040: コードブロックに言語指定を追加
   - MD047: ファイル末尾に改行を追加
   - jtf-style/3.3: 日本語表記の修正

4. **修正結果を確認**:

   ```bash
   pnpm lint
   ```

5. **VS Codeの警告も確認**:
   - ファイルを開いてVS Codeの画面に赤い波線や警告が表示されていないか確認
   - markdownlintの警告は必ず修正する
   - **重要**: CLIでのlintが通ってもVS Codeで警告が残る場合がある
   - **必須**: VS Codeで警告が0になるまで対応する

## ファイル作成テンプレート

### TypeScript設定ファイル

```typescript
// tsconfig.json
{
  "extends": "@configs/common/tsconfig/tsconfig.json",
  "compilerOptions": {
    // プロジェクト固有の設定
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### ESLint設定ファイル

```typescript
// eslint.config.ts
import { defineConfig } from '@configs/common';

export default defineConfig({
  // プロジェクト固有の設定
});
```

### package.json

```json
{
  "name": "@{scope}/{package-name}",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "build": "tsup",
    "lint": "eslint --max-warnings 0 .",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    // 依存関係
  },
  "devDependencies": {
    // 開発依存関係
  }
}
```
