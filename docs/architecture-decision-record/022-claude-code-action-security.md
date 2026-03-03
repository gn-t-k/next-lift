# ADR-022: Claude Code ActionのCI/CDセキュリティガイドライン

## ステータス

Accepted

## コンテキスト

PR #564のドキュメントレビューワークフロー（`document-review.yml`）でセキュリティインシデントが発生した。Claude Code Actionに`--allowedTools Bash`が設定されていたため、環境変数ダンプコマンド（`export`）が実行可能な状態であり、シークレットがPRコメントに平文で公開された。

### 根本原因

1. `--allowedTools Bash`で任意のシェルコマンド実行が許可されていた
2. プロンプト内で`gh pr comment`の使用を指示しており、Claudeが環境変数の出力をPRコメントに混入させた
3. PRコメント投稿時にシークレットのマスキングが行われなかった

## 決定内容

### 1. 自動ワークフロー（promptを指定するagentモード）

- `--allowedTools`は必要最小限のファイル読み取りツールに制限する
  - ドキュメントレビュー、コードレビュー: `Read,Glob,Grep`のみ
  - Bashが必要な場合: 具体的なコマンドプレフィックスで制限する（例: `Bash(git diff:*)`）
- **`--allowedTools Bash`（無制限Bash）は使用しない**
- PRコメント投稿はclaude-code-actionの組み込み機能（`use_sticky_comment`）を使用する
- プロンプト内でシェルコマンドの実行を指示しない

### 2. インタラクティブワークフロー（@claudeメンション）

- デフォルトのツール構成を使用する
- `allowedTools`の追加指定は原則として行わない

### 3. 権限設定

- `permissions`は各ワークフローで必要最小限を明示する
- `id-token: write`はclaude-code-actionが内部的にOIDCトークンを使用するため必須（`anthropic_api_key`直接使用時も必要）
- フォークPRの除外条件を追加する

### 4. サプライチェーン攻撃の防止

- GitHub Actionsのバージョン指定はタグではなくSHAでピン留めする

### 5. ローカル環境の追加防御

- `.claude/scripts/block-dangerous-commands.sh`フックで環境変数ダンプコマンド（`export`, `env`, `printenv`等）をブロックする

## 代替案

### A. settingsでBashコマンドを個別制限する

```yaml
settings: |
  {
    "permissions": {
      "deny": ["Bash(export:*)", "Bash(env:*)", "Bash(printenv:*)"]
    }
  }
```

**不採用理由**: ブロックリスト方式では未知の漏洩手段を防げない。Bash自体を許可しないアローリスト方式のほうが安全。

### B. PRコメント投稿時にシークレットをフィルタリングする

**不採用理由**: フィルタリングの漏れが漏洩に直結するため、根本対策（Bashの禁止）を優先した。

## 結果・影響

- 自動ワークフローでの環境変数漏洩リスクが排除される
- ドキュメントレビューの出力はclaude-code-actionの組み込み機能で安全に投稿される
- 新しいワークフローを追加する際は本ADRのガイドラインに従う

## 決定日

2026-03-02
