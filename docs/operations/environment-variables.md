# 環境変数の追加手順

新しい環境変数を追加する際のチェックリスト。

## チェックリスト

- [ ] `turbo.json` の `globalEnv` に追加（Turborepoキャッシュ無効化のため）
- [ ] `.env.example` に追加（新規開発者向けテンプレート）
- [ ] `.github/workflows/pr-push-check.yml` の `env` に追加（CI環境用）
- [ ] 機密情報の場合: GitHub Secretsに登録
- [ ] プレビュー環境で必要な場合: `.github/workflows/setup-preview.yml` で設定
- [ ] 本番環境: Vercelダッシュボードで手動設定

## 注意事項

- クライアント側で使用する環境変数には `NEXT_PUBLIC_` 接頭辞が必須
- `turbo.json` の `globalEnv` に追加しないと、環境変数変更時にキャッシュが無効化されない

## 関連ドキュメント

- [ADR-011: Monorepo環境変数管理](../architecture-decision-record/011-monorepo-environment-variables.md)
- [ADR-012: データベース環境戦略](../architecture-decision-record/012-database-environment-strategy.md)
