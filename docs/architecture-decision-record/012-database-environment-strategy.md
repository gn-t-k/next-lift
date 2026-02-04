# ADR-012: データベース環境戦略

## ステータス

Accepted

## コンテキスト

Next Liftシステムでは、Turso Databaseを使用して認証情報（Authentication DB）とユーザーデータ（Per-User DB）を管理する。開発・テスト・プレビュー・本番の各環境で適切なデータベース構成を決定する必要があった。

### 前提条件

- **Authentication DB**: ユーザー情報、セッション情報を管理するグローバルDB
- **Per-User DB**: ユーザーごとに独立したデータベースインスタンス（Turso Platform API経由で動的に作成）
- **デプロイ先**: Vercel（Serverless Functions）
- **モバイルアプリ**: React Native（Embedded Replicas使用）
- **料金プラン**: Turso Free（$0/月）→ 必要に応じてDeveloper（$4.99/月）

## 決定内容

以下の4つの環境を設定し、それぞれ異なるデータベース戦略を採用する。

## 環境ごとのデータベース構成

### 1. 本番環境（Production）

| DB種別 | DB名 | 場所 | 接続方法 |
|--------|------|------|----------|
| **Authentication DB** | `production-auth` | Turso Hosted | リモート接続 |
| **Per-User DB** | `production-user-{userId}` | Turso Hosted | **iOS**: Embedded Replicas<br>**Web**: リモート接続 |

- Web App: Vercelはサーバーレス環境のため、Embedded Replicasは使用不可。リモートのTurso DBに直接接続
- iOS App: Embedded Replicasを使用（ローカルファイル + リモート同期）

### 2. プレビュー環境（Preview）

| DB種別 | DB名 | 場所 | 接続方法 |
|--------|------|------|----------|
| **Authentication DB** | `preview-pr{number}-auth` | Turso Hosted（**PRごとに作成**） | リモート接続 |
| **Per-User DB** | `preview-pr{number}-user-{userId}` | Turso Hosted（**PRごとに作成**） | リモート接続のみ |

- PRごとに独立したDBを使用（完全分離）
- PR作成時にTurso Platform APIでDBを作成、PRクローズ時に自動削除
- Freeプラン（DB数100個）で十分運用可能

### 3. 開発環境（Development）

| DB種別 | DB名 | 場所 | 接続方法 |
|--------|------|------|----------|
| **Authentication DB** | `development-auth.db` | **ローカルlibSQL** | ローカルファイル |
| **Per-User DB** | `development-user-{userId}.db` | **ローカルlibSQL** | ローカルファイル |

- 完全にローカルのみで動作（同期なし）
- Turso Hostedを使用しない（課金対象外）
- オフライン開発可能、高速（ネットワーク遅延ゼロ）

### 4. テスト環境（Test）

| DB種別 | DB名 | 場所 | 接続方法 |
|--------|------|------|----------|
| **Authentication DB** | `:memory:` | libSQLインメモリ | インメモリ |
| **Per-User DB** | モック | - | モック |

- libSQLインメモリDBを使用し、テスト実行のたびにクリーンな状態
- Turso Hostedを使用しない（課金対象外）

## データベース命名規則

Tursoのグループ機能は使用せず、命名規則のみで環境を管理する。

### 命名規則: `next-lift-{環境}-{用途}-{識別子}`

| 環境 | Authentication DB | Per-User DB |
|------|------------------|-------------|
| **本番** | `next-lift-production-auth` | `next-lift-production-user-{userId}` |
| **プレビュー** | `next-lift-preview-pr{number}-auth` | `next-lift-preview-pr{number}-user-{userId}` |
| **開発** | ローカルファイル（Turso Hostedに作らない） | ローカルファイル（Turso Hostedに作らない） |
| **テスト** | インメモリ（Turso Hostedに作らない） | モック（Turso Hostedに作らない） |

環境名がプレフィックスに含まれるため、アルファベット順で環境ごとにまとまる。

## 環境変数の管理

ADR-011（Monorepo環境変数管理）に従い管理する。

- **ローカル開発**: ルートの`.env`ファイル（各パッケージにシンボリックリンク）
- **Vercel（Production/Preview）**: Vercelの環境変数設定機能
- **テスト**: インメモリDBを使用するため、DB接続用の環境変数は不要

## Per-User DB作成タイミング

**初回サインアップ時（アカウント作成時）** にPer-User DBを作成する。ログイン時にPer-User DBが存在しない場合は作成する（マイグレーション等のまれなケースに対応）。

## デプロイフック

GitHub Actionsを使用して、PRごとにDBを自動作成・削除する。

- **PR作成時**: Turso Platform APIでプレビュー用DBを作成
- **PRクローズ時**: プレビュー用DBをすべて削除（自動クリーンアップ）

## 結果・影響

### メリット

1. **環境の完全分離**
   - 本番・プレビュー・開発・テストが完全に分離される
   - 開発・テスト時に本番データに影響を与えない
   - PRごとに独立したプレビュー環境（レビューしやすい）

2. **コスト最適化**
   - Freeプラン（$0/月）で運用可能
   - 開発・テスト環境ではTurso Hostedを使わない
   - 必要に応じてDeveloperプラン（$4.99/月）に移行

3. **開発体験の向上**
   - ローカル開発で高速動作（ネットワーク遅延ゼロ）
   - オフライン開発可能
   - Embedded Replicasの検証はプレビュー・本番環境で可能

4. **管理のシンプル化**
   - グループ機能不要（命名規則のみ）
   - デプロイフックで自動作成・削除
   - 環境変数の設定が明確

### デメリット

1. **デプロイフックの実装が必要**
   - PR作成・削除時のDB操作を自動化する必要がある
   - GitHub Actionsの設定が必要

2. **Freeプランの制約**
   - DB数: 100個まで
   - 超過した場合はDeveloperプラン（$4.99/月）への移行が必要

3. **WebでEmbedded Replicasが使えない**
   - Vercelはサーバーレス環境のため、永続的なファイルシステムがない
   - Web Appはリモート接続のみ（レイテンシーあり）

## 代替案

### 1. すべての環境でTurso Hostedを使う

**開発環境もTurso Hostedを使用する案**

- **メリット**: 本番と同じ環境で開発できる
- **却下理由**:
  - 課金対象が増える
  - オフライン開発ができない
  - ネットワーク遅延がある

### 2. プレビュー環境でDBを共有する

**すべてのPRで同じDBを共有する案**

- **メリット**: DB数を節約、デプロイフック不要
- **却下理由**:
  - テストデータの衝突
  - PRごとに独立していない（レビューしにくい）
  - 手動クリーンアップが必要

### 3. グループ機能を使って環境を分離する

**Tursoのグループ機能で環境を分離する案**

- **メリット**: DBの整理がしやすい
- **却下理由**:
  - Scalerプラン（$24.92/月）が必要
  - グループはネストできない（PRごとのグループ分離が困難）
  - 命名規則のみで十分管理可能

## 決定日

2025-10-25
