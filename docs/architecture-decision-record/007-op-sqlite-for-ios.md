# ADR-007: op-sqlite (iOS SQLiteドライバー)

## ステータス

Accepted

## コンテキスト

React Native (iOS App）でTurso Embedded Replicasを使用するため、SQLiteドライバーを選定する必要があった。以下の要件があった:

- Turso Embedded Replicas対応（libSQL）
- Drizzle ORM対応
- iOS対応
- ローカルファーストでハイパフォーマンス
- アクティブにメンテされている

## 決定内容

iOS App用SQLiteドライバーとして**op-sqlite**を採用する。

### バージョン要件

- `@op-engineering/op-sqlite` v7.3.0以降（libSQL内蔵）

### セットアップ

```typescript
import { open } from '@op-engineering/op-sqlite';

const db = open({
  name: "local.db",
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
  syncInterval: 1000 // 1秒ごとに同期
});
```

### Development Build要件

op-sqliteはネイティブモジュールのため、**Expo Development Build**が必要（Expo Goでは動作しない）。

## 結果・影響

### メリット

- Turso Embedded Replicas完全対応（libSQL内蔵）
- React Native向けSQLiteライブラリで最高のパフォーマンス
  - 旧ライブラリ: 2秒、1.2GBメモリ
  - op-sqlite: ~500ms、250MBメモリ
  - Android: 8倍高速
- Drizzle ORM公式サポート
- 非同期実行でUIをブロックしない
- 複数のサンプルプロジェクトで実績あり
- Turso公式ブログで言及

### デメリット

- Expo Goで動作しない（Development Build必要）
  - 初回セットアップ: 30-40分
  - ネイティブモジュール追加時: 10-20分の再ビルド
- expo-sqliteより学習リソースが少ない

## 代替案

以下の選択肢を調査した:

### expo-sqlite@next

- **メリット**:
  - Expo公式の安心感
  - Live Queries機能
  - Expo Goで動作
  - 学習リソース豊富
- **却下理由**:
  - **Turso対応がベータ版**(本番環境非推奨）
  - op-sqliteよりパフォーマンスが低い
  - libSQLOptions機能は`expo-sqlite@next`のみ（安定版ではない）

### react-native-sqlite-storage

- **却下理由**: Turso Embedded Replicas非対応

## Development Buildの「つらさ」評価

**つらさ**: ⭐⭐ / ⭐⭐⭐⭐⭐ (許容範囲）

- 初回セットアップは1回のみ（30-40分）
- 日々の開発はExpo Goと同じ体験
- ネイティブモジュール追加頻度は低い（月数回程度）
- op-sqliteの高パフォーマンスとTurso本番対応のメリットが、Development Buildのコストを上回る

## 決定日

2025-10-19
