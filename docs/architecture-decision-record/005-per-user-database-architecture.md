# ADR-005: Per-User Database Architecture

## ステータス

Accepted

## コンテキスト

Tursoでローカルファーストを実現する方法を検討した結果、以下の制約が判明した:

- Turso Embedded Replicasは全体同期のみ（部分同期機能なし）
- 単一DBだと全ユーザーのデータがクライアントに同期されてしまう
- これはセキュリティ上の重大な問題

**重要な前提**: Per-User Databaseは「やりたいこと」ではなく、「Tursoでローカルファーストを実現するための唯一の手段」である。

## 決定内容

**Per-User Database構成**を採用する。

### 構成

- ユーザーごとに独立したTurso Databaseを作成
- 各ユーザーのクライアント（iOS App）は自分専用のDatabaseのEmbedded Replicaを持つ
- Per-User Database作成はNext.js Route Handlersで実行（Turso Platform API使用）

### Database作成フロー

1. ユーザー登録時
2. Next.js Route Handlers → Turso Platform API
3. Per-User Database作成
4. Database Tokenを発行
5. クライアントへToken返却
6. クライアントがEmbedded Replicaセットアップ

## 結果・影響

### メリット

- データ完全分離（セキュリティ）
- ユーザーごとに独立したDB管理
- Embedded Replicasでローカルファースト実現

### デメリット

- **ユーザー数上限: 最大10,000**（Turso Scalerプラン）
- マイグレーションが複雑（全DBに適用）
- DB管理コスト（多数のDB）

## 代替案

以下の選択肢を調査した:

### PowerSync + 単一PostgreSQL (部分同期)

```plaintext
単一PostgreSQL
  ↓
PowerSync(Sync Rules: WHERE user_id = current_user)
  ↓
各ユーザーのクライアント（SQLite Embedded Replica）
```

- **メリット**: ユーザー数上限なし、マイグレーションシンプル
- **却下理由**:
  - 複雑（PostgreSQL + PowerSync管理）
  - PowerSyncは聞いたことがなく、投資リスクが高い
  - 10,000ユーザー到達の可能性は低い

### ElectricSQL + 単一PostgreSQL

- **却下理由**: ベータ版、本番環境非推奨

### 単一Turso Database + クライアント側フィルター

```plaintext
単一Turso Database(全ユーザーデータ)
  ↓
各ユーザーのクライアント（全データ同期）
  ↓
アプリ側でuser_idフィルタ
```

- **却下理由**: **絶対に採用すべきでない**(セキュリティリスク）
  - 他人のデータが端末に保存される
  - データ量が膨大
  - ストレージ圧迫

## トレードオフ

Per-User Database構成は以下のトレードオフを伴う:

- ✅ セキュリティ: 完全なデータ分離
- ✅ シンプルさ: Tursoのマネージドサービス
- ❌ スケーラビリティ: 最大10,000ユーザー
- ❌ マイグレーション: 複雑

ただし、個人開発で10,000ユーザー到達の可能性は低く、到達した場合はその時点で移行を検討すれば良い（嬉しい悲鳴）。

## 決定日

2025-10-19
