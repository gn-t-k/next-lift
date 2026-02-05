# ADR-021: 開発環境のTurso DB移行

## ステータス

Accepted

## コンテキスト

[ADR-012](./012-database-environment-strategy.md)では、開発環境でローカルSQLiteファイルを使用する戦略を採用していた。しかし、運用を通じて以下の課題が明らかになった。

### 課題

1. **本番環境との差異**
   - ローカルSQLiteはネットワーク遅延がゼロのため、N+1問題や非効率なクエリに気づきにくい
   - 本番環境でのパフォーマンス問題を開発時に検出できない

2. **コードの複雑化**
   - 環境によってTursoとローカルSQLiteを切り替えるロジックが必要
   - `create-local-per-user-database.ts` と `create-turso-per-user-database.ts` の二重管理
   - `isProduction` フラグによる分岐処理

## 決定内容

開発環境でもTurso Hosted DBを使用するように変更する。

### 変更後の環境ごとのデータベース構成

| 環境 | Authentication DB | Per-User DB |
|------|------------------|-------------|
| **本番** | Turso Hosted | Turso Hosted |
| **プレビュー** | Turso Hosted（PRごと） | Turso Hosted（PRごと） |
| **開発** | **Turso Hosted（開発者ごと）** | **Turso Hosted（開発者ごと）** |
| **テスト** | インメモリ（`:memory:`） | インメモリ（`:memory:`） |

### データベース命名規則

| 環境 | Authentication DB | Per-User DB |
|------|------------------|-------------|
| **本番** | `next-lift-production-auth` | `next-lift-production-user-{userId}` |
| **プレビュー** | `next-lift-preview-pr{number}-auth` | `next-lift-preview-pr{number}-user-{userId}` |
| **開発** | `next-lift-dev-{developer}-auth` | `next-lift-dev-{developer}-user-{userId}` |
| **テスト** | インメモリ | インメモリ |

### 環境変数の管理

- **ローカル開発**: 開発者ごとのTurso Hosted DBに接続するための環境変数を`.env`に設定する
- **テスト環境**: インメモリDBを使用するための環境変数を設定する

### 開発者用DB管理スクリプト

Authentication DB用の管理スクリプトを提供：

- `pnpm dev:db:create` - 開発者用DBの作成
- `pnpm dev:db:destroy` - 開発者用DBの削除
- `pnpm dev:db:reset` - データのリセット（削除して再作成）

Per-User DBはアプリ操作（サインアップ）で自動作成されるため、管理スクリプトは不要。

## 結果・影響

### メリット

1. **本番環境との一貫性**
   - 開発時からネットワーク遅延を含めたパフォーマンスを体感できる
   - 非効率なクエリやN+1問題に早期に気づける

2. **コードのシンプル化**
   - `create-local-per-user-database.ts` を削除
   - `isProduction` による分岐ロジックを削除
   - 環境変数スキーマから `file:` 形式の許可を削除

### デメリット

1. **オフライン開発不可**
   - ネットワーク接続が必須になる
   - ただし、実運用上ほとんど問題にならない

2. **初期セットアップの追加作業**
   - 開発者ごとにTurso DBを発行する必要がある
   - 環境変数の設定が必須

3. **Turso DB数の増加**
   - 開発者数に応じてDB数が増加
   - Freeプラン（100 DB）の範囲内で運用可能

## 代替案

### Turso CLIのローカルエミュレータを使用

`turso dev` コマンドでローカルにTursoエミュレータを起動する案。

- **メリット**: オフライン開発可能、Turso DB数を消費しない
- **却下理由**: 本番環境との完全な一貫性が得られない、エミュレータ特有の挙動の可能性

## 参照

- [ADR-012: データベース環境戦略](./012-database-environment-strategy.md)（本ADRによりSuperseded）

## 決定日

2026-01-08

