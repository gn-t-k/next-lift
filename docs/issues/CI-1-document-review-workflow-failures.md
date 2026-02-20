# CI-1: Document Reviewワークフローの失敗率が高い

**対象**: `.github/workflows/document-review.yml`
**優先度**: 高

## 問題

Document Reviewワークフローが約39%の確率で失敗している（直近50ランで成功17件 / 失敗11件 / スキップ12件）。失敗には2つのパターンがある。

### パターン1: Bot起因のトリガー拒否（失敗の64%）

`merge-master.yml`ワークフローが`next-lift-merge-master` GitHub Appのトークンを使ってmainブランチをPRブランチにマージすると、`pull_request: synchronize`イベントが発火してDocument Reviewが起動する。`anthropics/claude-code-action`はデフォルトでBot起因の実行を拒否するため、即座に失敗する（実行時間8〜15秒）。

```
Action failed with error: Workflow initiated by non-human actor: next-lift-merge-master (type: Bot).
Add bot to allowed_bots list or use '*' to allow all bots.
```

### パターン2: Claude実行エラー（失敗の36%）

Claude APIとの通信途中で失敗する一時的なエラー。実行時間1分程度で、同じPRの再実行で成功することから、APIの一時障害と推測される。

```
Action failed with error: Claude execution failed: Execution failed:
```

## 修正内容

### パターン1の修正

`claude-code-action`の`allowed_bots`パラメータに`next-lift-merge-master`を追加する。エラーメッセージで案内されている公式パラメータであり、`'*'`（全Bot許可）ではなく特定のBotのみ許可することでセキュリティを維持する。

```yaml
- uses: anthropics/claude-code-action@edd85d61533cbba7b57ed0ca4af1750b1fdfd3c4 # v1
  with:
    anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
    allowed_bots: "next-lift-merge-master"
```

### パターン2の対応

経過観察とする。発生頻度が低く（50ラン中4件、約8%）、一時的なAPI障害が原因であり再実行で解決する。パターン1を修正すれば全体の失敗率は39%から約8%に改善される。

## 対象ファイル

- `.github/workflows/document-review.yml`

## 検証方法

- `next-lift-merge-master` Botによるマージ後にDocument Reviewが正常に実行されること
- Bot起因のトリガー拒否エラーが発生しなくなること
