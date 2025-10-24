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

**詳細:**

**Web App（Next.js）:**
```javascript
// Server ComponentsまたはRoute Handlers
const client = createClient({
  url: process.env.TURSO_DATABASE_URL,  // libsql://production-auth.turso.io
  authToken: process.env.TURSO_AUTH_TOKEN,
});
```
- Vercelはサーバーレス環境のため、Embedded Replicasは使用不可
- リモートのTurso DBに直接接続

**iOS App（React Native）:**
```javascript
const client = createClient({
  url: 'file:local.db',  // ローカルSQLiteファイル
  syncUrl: process.env.TURSO_DATABASE_URL,  // libsql://production-user-{userId}.turso.io
  authToken: process.env.TURSO_AUTH_TOKEN,
  syncInterval: 60,  // 60秒ごとに自動同期
});
```
- Embedded Replicasを使用（ローカルファイル + リモート同期）
- 読み取り: ローカルSQLite（マイクロ秒レベル）
- 書き込み: リモートTurso DB → 自動的にローカルに同期

### 2. プレビュー環境（Preview）

| DB種別 | DB名 | 場所 | 接続方法 |
|--------|------|------|----------|
| **Authentication DB** | `preview-pr{number}-auth` | Turso Hosted（**PRごとに作成**） | リモート接続 |
| **Per-User DB** | `preview-pr{number}-user-{userId}` | Turso Hosted（**PRごとに作成**） | リモート接続のみ |

**詳細:**

**Web App（Next.js）:**
```javascript
const client = createClient({
  url: process.env.TURSO_DATABASE_URL,  // libsql://preview-pr123-auth.turso.io
  authToken: process.env.TURSO_AUTH_TOKEN,
});
```
- リモートのTurso DBに直接接続
- PRごとに独立したDBを使用（完全分離）

**iOS App:**
- プレビュー環境では未実装（Webのみ）

**デプロイフック:**
- **PR作成時**: Turso Platform APIで`preview-pr{number}-auth`を作成
- **PRクローズ時**: `preview-pr{number}-*`を削除（自動クリーンアップ）

**料金プラン制約:**
- Freeプラン（DB数100個）で十分運用可能
- 例: 本番50個 + プレビュー10個（5PR × 2DB） = 60個

### 3. 開発環境（Development）

| DB種別 | DB名 | 場所 | 接続方法 |
|--------|------|------|----------|
| **Authentication DB** | `development-auth.db` | **ローカルlibSQL** | ローカルファイル |
| **Per-User DB** | `development-user-{userId}.db` | **ローカルlibSQL** | ローカルファイル |

**詳細:**

**Web App（Next.js）/ iOS App（React Native）:**
```javascript
const client = createClient({
  url: 'file:development-auth.db',  // ローカルのみ（同期なし）
});
```
- 完全にローカルのみで動作（同期なし）
- Turso Hostedを使用しない（課金対象外）
- 開発者ごとに独立したローカルDB（共有なし）

**メリット:**
- オフライン開発可能
- 高速（ネットワーク遅延ゼロ）
- 課金なし

### 4. テスト環境（Test）

| DB種別 | DB名 | 場所 | 接続方法 |
|--------|------|------|----------|
| **Authentication DB** | `:memory:` | libSQLインメモリ | インメモリ |
| **Per-User DB** | モック | - | モック |

**詳細:**

**CI（GitHub Actions）/ ローカルテスト:**
```javascript
const client = createClient({
  url: ':memory:',  // インメモリDB（テスト実行のたびにリセット）
});
```
- libSQLインメモリDBを使用
- Turso Hostedを使用しない（課金対象外）
- テスト実行のたびにクリーンな状態

## データベース命名規則

Tursoのグループ機能は使用せず、命名規則のみで環境を管理する。

### 命名規則: `{環境}-{用途}-{識別子}`

| 環境 | Authentication DB | Per-User DB |
|------|------------------|-------------|
| **本番** | `production-auth` | `production-user-{userId}` |
| **プレビュー** | `preview-pr{number}-auth` | `preview-pr{number}-user-{userId}` |
| **開発** | ローカルファイル（Turso Hostedに作らない） | ローカルファイル（Turso Hostedに作らない） |
| **テスト** | インメモリ（Turso Hostedに作らない） | モック（Turso Hostedに作らない） |

**例:**
```text
production-auth
production-user-abc123
preview-pr123-auth
preview-pr123-user-def456
preview-pr124-auth
preview-pr124-user-ghi789
```

**アルファベット順での並び:**
```text
preview-pr123-auth
preview-pr123-user-def456
preview-pr124-auth
preview-pr124-user-ghi789
production-auth
production-user-abc123
```
環境ごとにまとまるため、管理しやすい。

## Turso Hosted DBの構成

```text
Turso Organization: next-lift
└── default（グループ）
    ├── production-auth
    ├── production-user-{userId}（複数）
    ├── preview-pr123-auth
    ├── preview-pr123-user-{userId}（複数）
    ├── preview-pr124-auth
    └── preview-pr124-user-{userId}（複数）

合計: N（本番） + M（プレビュー） ≤ 100個（Freeプラン制約）
```

**開発環境とテスト環境はTurso Hostedを使わない（ローカルlibSQLのみ）**

## 環境変数の管理

ADR-011（Monorepo環境変数管理）に従い、以下の方法で管理する。

### ローカル開発（Development）

ルートに`.env`ファイルを配置（各パッケージにシンボリックリンク）

```bash
# .env
NODE_ENV=development

# ローカル開発ではTursoを使わないため、DB URLは不要
# （libSQLローカルファイルを使用）
```

### Vercel（Production/Preview）

Vercelの環境変数設定機能を使用

**Production環境:**
```bash
NODE_ENV=production
TURSO_AUTH_DATABASE_URL=libsql://production-auth.turso.io
TURSO_AUTH_DATABASE_AUTH_TOKEN=xxx
TURSO_PLATFORM_API_TOKEN=yyy
TURSO_ORGANIZATION=next-lift
```

**Preview環境:**
```bash
NODE_ENV=preview
TURSO_AUTH_DATABASE_URL=libsql://preview-pr${PR_NUMBER}-auth.turso.io
TURSO_AUTH_DATABASE_AUTH_TOKEN=xxx
TURSO_PLATFORM_API_TOKEN=yyy
TURSO_ORGANIZATION=next-lift
```

### CI/CD（Test）

GitHub SecretsまたはlibSQL設定（環境変数不要）

```bash
# テスト環境ではインメモリDBを使用するため、環境変数不要
NODE_ENV=test
```

## Per-User DB作成タイミング

**初回サインアップ時（アカウント作成時）** にPer-User DBを作成する。

```typescript
// 擬似コード
async function handleSignup(userId: string) {
  // 1. Authentication DBにユーザー情報を保存
  await saveUserToAuthDB(userId);

  // 2. Per-User DBを作成
  const env = process.env.NODE_ENV; // 'production' | 'preview' | 'development'
  const dbName = `${env}-user-${userId}`;
  const perUserDB = await createPerUserDB(dbName);

  // 3. DBトークンを返す
  return { userId, dbToken: perUserDB.token };
}

async function handleLogin(userId: string) {
  // 1. Per-User DBが存在するかチェック
  const dbExists = await checkPerUserDBExists(userId);

  if (!dbExists) {
    // 2. 存在しない場合は作成（まれなケース: マイグレーション等）
    await createPerUserDB(userId);
  }

  // 3. DBトークンを返す
  return { userId, dbToken: getDBToken(userId) };
}
```

## デプロイフックの実装

Vercel Deploy Hooksを使用して、PRごとにDBを作成・削除する。

### PR作成時

```yaml
# .github/workflows/preview-db-create.yml
name: Create Preview Database

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  create-db:
    runs-on: ubuntu-latest
    steps:
      - name: Create Turso Database
        run: |
          DB_NAME="preview-pr${{ github.event.pull_request.number }}-auth"
          curl -X POST "https://api.turso.tech/v1/organizations/${{ secrets.TURSO_ORGANIZATION }}/databases" \
            -H "Authorization: Bearer ${{ secrets.TURSO_PLATFORM_API_TOKEN }}" \
            -H "Content-Type: application/json" \
            -d "{\"name\": \"$DB_NAME\", \"group\": \"default\"}"
```

### PRクローズ時

```yaml
# .github/workflows/preview-db-delete.yml
name: Delete Preview Database

on:
  pull_request:
    types: [closed]

jobs:
  delete-db:
    runs-on: ubuntu-latest
    steps:
      - name: Delete Turso Databases
        run: |
          PREFIX="preview-pr${{ github.event.pull_request.number }}-"
          # preview-pr{number}-* のDBをすべて削除
          turso db list --json | jq -r ".[] | select(.Name | startswith(\"$PREFIX\")) | .Name" | \
            xargs -I {} turso db destroy {} --yes
```

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
