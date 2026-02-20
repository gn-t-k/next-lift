# CI-2: vercel.jsonの`deploymentEnabled`に`fix/`ブランチが未登録

**対象**: `apps/web/vercel.json`
**優先度**: 中

## 問題

PR #529（ブランチ: `fix/CI-1-document-review-workflow`）で、`with-preview`ラベルを付けていないにもかかわらず、Vercel GitHub Integrationの自動デプロイが実行された。

### 原因

`apps/web/vercel.json`の`git.deploymentEnabled`に`fix/`プレフィックスが含まれておらず、Vercelはリストにないブランチをデフォルト`true`として扱うため、自動デプロイが実行された。

本番・プレビューともにGitHub Actions（`production-deploy.yml` / `setup-preview.yml`）でデプロイを管理しているため、Vercel GitHub Integrationの自動デプロイは全ブランチで不要。

## 修正内容

ブランチ個別指定から`deploymentEnabled: false`に変更する。これにより、すべてのブランチでVercel GitHub Integrationの自動デプロイが無効化され、今後新しいブランチプレフィックスを追加しても設定漏れが発生しなくなる。

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "git": {
    "deploymentEnabled": false
  }
}
```

## 対象ファイル

- `apps/web/vercel.json`

## 検証方法

- 修正後、PR上でVercelの自動デプロイステータスチェックが表示されなくなることを確認
