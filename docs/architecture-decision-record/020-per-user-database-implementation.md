# ADR-020: Per-User Database実装詳細

## ステータス

Accepted（環境ごとの動作は[ADR-021](./021-development-environment-turso-migration.md)で部分的に更新）

## コンテキスト

ADR-005でPer-User Database構成を採用することを決定した。本ADRでは、その具体的な実装方法について決定する。

具体的に以下の設計判断が必要であった：

1. Per-User DB情報（DB名、接続Token）の保存場所
2. データモデリング方針（イベント vs 状態）
3. Tokenの有効期限管理
4. Tokenのセキュリティ（暗号化）
5. 外部キー制約の有無
6. Per-User DBへのマイグレーション適用方式
7. Authentication DBのスキーマ管理方針

## 決定内容

### 1. Per-User DB情報の保存

`per_user_database`テーブルを作成してAuthentication DBに保存する。

### 2. 状態テーブル（ミュータブル）の採用

イミュータブルデータモデル（イベントソーシング）と状態テーブル（ミュータブル）を比較検討した結果、**状態テーブル**を採用した。

| 観点 | イベントソーシング | 状態テーブル |
|------|------------------|-------------|
| Token取得 | O(n) - 最新イベント検索 | O(1) - 直接参照 |
| テーブル数 | 2テーブル（作成+発行） | 1テーブル |
| 履歴保持 | ✅ 全履歴保持 | ❌ 最新のみ |
| 実装複雑度 | 高い | 低い |

**状態テーブルを選択した理由:**

- Token発行履歴を保持するユースケースが存在しない
- Token取得は頻繁に発生するため、O(1)での取得が望ましい
- シンプルな実装が保守性を高める
- 履歴を残しても使い道が明確でないため、デメリット（複雑さ）だけが残る

### 3. 外部キー制約の不採用

`userId`カラムに外部キー制約を**設けない**。

ADR-019で決定した「アカウント削除時にPer-User Databaseは保持する」方針と、外部キー制約のいずれのオプションも整合しない：

- `CASCADE`: userテーブル削除時にレコードも削除される（方針に反する）
- `SET NULL`: userIdがNULLになり、どのユーザーのDBか特定不能になる
- `RESTRICT`/`NO ACTION`: user削除がブロックされる

したがって、外部キー制約は設けず、アプリケーション層で整合性を担保する。

### 4. Token暗号化

TokenはAES-256-GCMで暗号化して保存する。

- Database Tokenが漏洩した場合、Per-User DBへの不正アクセスが可能
- 暗号化により、DBダンプ漏洩時のリスクを軽減
- AES-256-GCMは認証付き暗号化であり、改ざん検知も可能

### 5. Token管理

- 30日有効期限でTokenを発行
- 有効期限付きでテーブルに保存
- 期限切れ時にTurso Platform APIで再発行し、テーブルをUPDATE

### 6. マイグレーション適用方式

接続時にチェック・適用する方式を採用。

### 7. スキーマ管理方針

Better Auth自動生成スキーマと手動管理スキーマを分離する。

## 結果・影響

### 環境変数

以下の環境変数を追加（すべて必須、開発環境ではダミー値を設定）：

- `TURSO_PLATFORM_API_TOKEN`: Turso Platform API Token
- `TURSO_ORGANIZATION`: Turso組織名
- `TURSO_TOKEN_ENCRYPTION_KEY`: Token暗号化用の32バイト（256ビット）キー（hex形式、64文字）
- `APP_ENV`: 環境識別子（`production` | `development-{name}` | `preview-pr{n}`）

### 環境ごとの動作

`NODE_ENV === "production"`で本番/プレビュー環境とローカル開発環境を判定する。

**APP_ENVと命名規則:**

| 環境 | APP_ENV | 認証DB名 | Per-User DB名 |
| ---- | ------- | -------- | ------------- |
| 本番 | `production` | `next-lift-production-auth` | `next-lift-production-user-{userIdHash}` |
| プレビュー | `preview-pr{N}` | `next-lift-preview-pr{N}-auth` | `next-lift-preview-pr{N}-user-{userIdHash}` |
| 開発（Turso） | `development-{name}` | `next-lift-development-{name}-auth` | `next-lift-development-{name}-user-{userIdHash}` |
| 開発（ローカル） | `development-{name}` | ローカルファイル | `./data/per-user-db/{userId}.db` |
| テスト | `development-test` | インメモリ | インメモリ |

**userIdHashについて:**

Turso DB名は最大56文字の制限がある。userIdがUUID（36文字）の場合、`next-lift-development-gntk-user-{uuid}` は68文字となり制限を超える。

そのため、userIdをSHA-256でハッシュ化し、先頭16文字（64ビット）を使用する：

1. userIdを正規化（小文字化、アンダースコア→ハイフン）
2. SHA-256でハッシュ化
3. 先頭16文字を取得

16文字（64ビット）の衝突確率は、10,000ユーザー（Turso制約上限）で約2.7×10⁻¹²と実質ゼロ。

開発環境でローカルDBを使用する理由：

- 認証DBと同じ方針で統一（ローカルはローカル、リモートはリモート）
- DBの中身確認や実験的な操作が気軽にできる
- 認証DBはローカル、Per-User DBはTursoという混在は認知負荷が高い

開発環境でもダミートークンを暗号化して保存する理由：

- コードパスを本番と統一し、暗号化周りのバグを早期検出
- nullableカラムを排除し、スキーマをシンプルに保つ

## 代替案

### 1. イベントソーシング（イミュータブルデータモデル）

DB作成とToken発行を別々のイベントテーブルで管理する方式。

**却下理由**: Token履歴を保持するユースケースがなく、複雑さだけが増す。Token取得がO(n)になりパフォーマンス面でも不利。

### 2. 外部キー制約（CASCADE）

`userId`に外部キー制約を設け、user削除時に自動削除する方式。

**却下理由**: ADR-019の「アカウント削除時にPer-User DBを保持する」方針と矛盾する。

### 3. Tokenの平文保存

暗号化せずにTokenを保存する方式。

**却下理由**: DBダンプ漏洩時にPer-User DBへの不正アクセスが可能になるリスクがある。

### 4. Database URLの動的生成

`organization`と`databaseName`からURLを動的に生成する方式。

**却下理由**: テーブル設計を見ただけでは「なぜURLがないのか？」という疑問が生じる。命名規則を知らないと理解できない暗黙的な設計より、明示的にURLを保存する方が理解しやすい。

### 5. Tokenの毎回取得

DBアクセス時に毎回Turso Platform APIからTokenを取得する方式。

**却下理由**: ネットワークラウンドトリップが2回になる。有効期限付きでキャッシュする方が効率的。

### 6. Turso Multi-DB Schemasでマイグレーション

Tursoの機能を使って全DBに一括マイグレーション適用。

**却下理由**: 当該機能が非推奨（deprecated）になった。

## 決定日

2025-12-23
