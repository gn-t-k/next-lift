# ADR-004: Turso Database

## ステータス

Accepted

## 関連ADR

- [ADR-005: Per-User Database Architecture](./005-per-user-database-architecture.md) - Tursoの制約により必須となるアーキテクチャ
- [ADR-010: Local-first Architecture](./010-local-first-architecture.md) - Turso Embedded Replicasを活用したアーキテクチャパターン

## コンテキスト

Next Liftのデータベースを選定するにあたり、以下の要件があった:

- ローカルファーストでハイパフォーマンスを実現したい
- ネットワーク環境に左右されないパフォーマンス
- WebとiOS両方で使えるデータベース
- RDBが望ましい（開発者の経験値）
- SQLiteベースでローカルテストがしやすい

## 決定内容

データベースとして**Turso**を採用する。

### 構成

- **バックエンドDB**: Turso (libSQL)
- **クライアントDB**: SQLite (Embedded Replicas)
- **認証DB**: Turso (Authentication Database)
- **ユーザーデータDB**: Turso (Per-User Databases)

## 結果・影響

### メリット

- Embedded Replicasでローカルファースト実現可能（詳細は[ADR-010](./010-local-first-architecture.md)参照）
- マネージドサービスで運用負荷が低い
- WebとReact Native両対応
- SQLiteベースでローカルテストがしやすい
- 無料枠が大きい（500データベースまで無料）
- 個人開発の規模に適している

### デメリット

- ユーザー数上限: 最大10,000（Scalerプラン）
- Per-User Database構成が必須（Tursoの制約、詳細は[ADR-005](./005-per-user-database-architecture.md)参照）
- マイグレーションが複雑（全DBに適用必要）
- ベンダーロックインのリスク

## 代替案

以下の選択肢を調査した:

### PowerSync + 単一PostgreSQL

- **メリット**: ユーザー数上限なし、部分同期可能、PostgreSQL使用
- **却下理由**:
  - 複雑（PostgreSQL + PowerSync管理）
  - PowerSyncは聞いたことがなく、投資リスクが高い
  - 個人開発には過剰

### ElectricSQL + 単一PostgreSQL

- **メリット**: ユーザー数上限なし、オープンソース
- **却下理由**:
  - ベータ版、本番環境非推奨
  - Postgresスキーマ制約あり
  - PowerSyncより機能が限定的

### CR-SQLite

- **メリット**: CRDT同期、オープンソース
- **却下理由**:
  - 同期サーバーの実装が必要
  - コミュニティが小さい
  - ドキュメントが少ない

## 重要な制約: Turso Embedded Replicasの部分同期について

調査の結果、Turso Embedded Replicasは**データベース全体を同期**する仕組みであり、特定ユーザーのデータ（例: `user_id='123'`の行のみ）だけを同期する行レベルの部分同期機能は存在しない。

そのため、単一Turso Database + 複数ユーザーのEmbedded Replicasという構成は**セキュリティ上不可能**であり、Per-User Database構成が唯一の選択肢となった（[ADR-005](./005-per-user-database-architecture.md)参照）。

## 決定日

2025-10-19
