# ADR-010: Local-first Architecture

## ステータス

Accepted

## 関連ADR

- [ADR-004: Turso Database](./004-turso-database.md) - Local-firstを実現するデータベース選定
- [ADR-005: Per-User Database Architecture](./005-per-user-database-architecture.md) - Local-firstで必須となるDB構成

## コンテキスト

Next Liftのアーキテクチャパターンを決定するにあたり、以下の要件があった:

- ネットワーク環境に左右されないハイパフォーマンス
- オフラインでも動作するアプリ
- ユーザー体験の向上（読み取りが即座、書き込みも高速）
- WebとiOS両方で実現

## 決定内容

**Local-first Architecture**を採用する。

### 実装方法

**Turso Embedded Replicas**を使用したLocal-first設計:

- ローカルSQLiteファイルをメインDB
- リモートTurso Databaseと自動同期
- **読み取り**: ローカルから（マイクロ秒単位、ネットワーク遅延ゼロ）
- **書き込み**: リモートへ送信後、自動同期（Read Your Own Writes保証）

### 技術スタック

- **iOS App**: op-sqlite + Turso Embedded Replicas
- **Web App**: @libsql/client (+ Embedded Replicas可能であれば）
- **データベース構成**: Per-User Database

### セットアップ例 (iOS App)

```typescript
import { open } from '@op-engineering/op-sqlite';

const db = open({
  name: "local.db",
  url: process.env.TURSO_DATABASE_URL,      // リモートDB
  authToken: process.env.TURSO_AUTH_TOKEN,
  syncInterval: 1000                         // 1秒ごとに同期
});
```

## 結果・影響

### メリット

- オフライン対応可能
- 読み取りパフォーマンス最高（ローカルから、マイクロ秒単位）
- ネットワーク遅延の影響を受けない
- ユーザー体験の大幅な向上
- 書き込みも高速（ローカルで即座に反映、バックグラウンドで同期）
- マネージドサービス（Turso）で運用負荷低い
- WebとReact Native両対応

### デメリット

- Per-User Database構成が必須（[ADR-004](./004-turso-database.md)、[ADR-005](./005-per-user-database-architecture.md)参照）
  - **ユーザー数上限: 最大10,000**（Turso Scalerプラン制約）
- 同期競合の可能性（Last Write Wins方式）
- ストレージ容量の消費（ローカルDB）

## 代替案

以下の選択肢を検討した:

### PowerSync / ElectricSQL + 単一PostgreSQL

部分同期をサポートするPostgreSQL系のLocal-firstソリューション。

- **メリット**: ユーザー数上限なし、部分同期可能
- **却下理由**: 複雑さ、投資リスク、個人開発には過剰（詳細は[ADR-004](./004-turso-database.md)参照）

### サーバーファースト（従来型）

```text
クライアント → ネットワーク → サーバーDB
```

- **却下理由**:
  - ネットワーク遅延の影響を受ける
  - オフライン対応不可
  - パフォーマンスが劣る
  - Next Liftの要件を満たさない

## トレードオフ

Local-first Architectureは以下のトレードオフを伴う:

- ✅ オフライン対応、最高パフォーマンス、UX向上
- ❌ ユーザー数上限（10,000）、同期競合の可能性

ただし、個人開発で10,000ユーザー到達の可能性は低く、到達した場合はその時点でPowerSyncへの移行を検討すれば良い。

## 決定日

2025-10-19
