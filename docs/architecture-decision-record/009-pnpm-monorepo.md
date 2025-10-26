# ADR-009: pnpm + Monorepo

## ステータス

Accepted

## コンテキスト

Next Liftのパッケージ管理とプロジェクト構成を決定する必要があった。以下の要件があった:

- Reactコンポーネント用のパッケージを分離
- データベース接続・スキーマ定義のパッケージを分離
- AppとPackageの疎結合化
- テストしやすさ
- フレームワーク変更時の柔軟性

## 決定内容

パッケージマネージャーとして**pnpm**、プロジェクト構成として**Monorepo**を採用する。

### Monorepo構成

```plaintext
/apps
  ├── ios      (React Native + op-sqlite + Drizzle)
  └── web      (Next.js + Better Auth + Turso)
/packages
  ├── react-components            (Web用共通コンポーネント)
  ├── react-native-components     (iOS用共通コンポーネント)
  ├── per-user-database           (Per-User DB スキーマ + クライアント)
  └── authentication              (認証機能)
```

## 結果・影響

### メリット (pnpm)

- 開発者が慣れている（仕事で使用経験あり）
- Next Lift構成（Expo、Next.js、Vercel）と完全互換
- 安定性と成熟度が高い
- Monorepoネイティブサポート
- ディスク効率良好（npmの70%削減）
- npmの2-3倍高速で十分な性能
- Vercelゼロコンフィグデプロイ対応（`pnpm-lock.yaml`で自動認識）
- 厳格な依存関係管理（幽霊依存を防ぐ）

### メリット (Monorepo)

- コード共有が容易（Reactコンポーネント、DBスキーマ等）
- 一貫したバージョン管理（すべてのパッケージが同期）
- 原子的コミット（複数パッケージの変更を1つのPRで）
- 開発体験（1つのIDEですべて編集可能）
- AppとPackageの疎結合化
- テストしやすさ
- フレームワーク変更時の柔軟性

### デメリット

- Bunより遅い（4倍程度）
  - ただし、個人開発でpnpmの速度で十分
  - インストール時間の差: Bun 8.6秒vs pnpm 31.9秒（20秒程度の差は許容範囲）
- npmより学習コスト高い（シンボリックリンクの理解が必要）

## 代替案

以下の選択肢を調査した:

### Bun

- **メリット**:
  - 圧倒的な速度（pnpmの4倍、npmの7倍）
  - Monorepo高速
  - Vercelゼロコンフィグ対応
- **却下理由**:
  - Expo完全対応に課題（Node.js LTS必要、完全Bunのみは不安定）
  - Next.js Bunランタイム非対応（パッケージマネージャーのみ）
  - 成熟度がpnpmより低い
  - 20秒の差のために学習コスト・リスクを払う価値は低い

### Yarn Berry

- **メリット**: Monorepo最強（制約機能、選択的インストール）
- **却下理由**:
  - 学習コスト高すぎ（PnP）
  - React Native/Expoとの互換性懸念
  - 速度が遅い

### npm

- **却下理由**:
  - 遅い（すべての中でもっとも遅い）
  - ディスク効率悪い
  - Monorepo弱い（外部ツール必要）
  - pnpmが完全上位互換

### Polyrepo（代替のプロジェクト構成）

- **メリット**: 完全分離、独立デプロイ
- **却下理由**:
  - コード共有が複雑
  - バージョン管理が煩雑
  - Next Liftの規模では過剰

## 決定日

2025-10-19
