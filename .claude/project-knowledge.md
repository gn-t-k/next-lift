# プロジェクト知識

## アーキテクチャ決定事項

### 1. 認証APIサーバー採用

**決定理由**: Next.js Route Handlersでは認証管理が複雑

**メリット**:

- 認証専用APIサーバーで責務を分離
- Better Auth統合による多様な認証方式対応
- Web・iOS両方に統一的な認証APIを提供
- Cloudflare Workers/Node.js対応でデプロイの柔軟性

### 2. Turso統一DB採用

**決定理由**: SQLite互換でローカル開発・テスト容易

**メリット**:

- Better Auth用データもTursoで統一管理
- Embedded Replicas対応でオフライン機能実現
- Per-User Database構成でデータ分離

### 3. Better Auth クロスプラットフォーム認証

**技術検証済み事項**:

- ✅ 統合型アーキテクチャ（Hono内に直接統合）
- ✅ 共通バックエンド（WebアプリとiOSアプリが同じインスタンスを参照）
- ✅ セッション管理：
  - Web：HTTPOnlyクッキー（7日間、自動更新）
  - iOS：Expo SecureStore（セッショントークン保存）
- ✅ OAuth対応（Apple ID、Google認証両方サポート）

### 4. Turso Embedded Replicas データ同期

**技術検証済み事項**:

- ✅ React Native対応（op-sqliteライブラリで実装確認済み）
- ✅ Drizzle ORM対応（React Native + op-sqlite + Drizzle完全サポート）
- ✅ Live Query機能（リアルタイムデータ更新対応）
- ✅ リアルタイム同期（書き込み後即座にローカル反映）
- ✅ 高速読み取り（マイクロ秒レベルのローカル読み取り）
- ✅ オフライン対応（ネットワーク切断時も動作継続）

### 5. Drizzle ORM統一

**実装パターン**:

- **Web**: Turso Embedded Replicas直接接続
- **iOS**: op-sqliteドライバー使用
- **Hono**: Turso直接接続
- **型安全性**: TypeScript完全対応
- **マイグレーション**: 統一されたスキーマ管理

## 開発計画

### Phase 1: インフラ構築

- モノレポ環境構築（pnpm workspaces + turborepo）
- 認証APIサーバー構築（Hono + Better Auth）
- Better Auth設定
- Turso Database設定
- Web/iOS/Turso連携の基盤整備

### Phase 2: 基本機能実装

- 認証システム（Apple ID、Google認証）
- 基本的なデータ記録・表示機能
- データ同期機能

### Phase 3: 機能拡張

- 統計データ分析機能
- トレーニング計画作成機能
- 音声・画像入力機能（将来）

## 開発方針

### 基本原則

- **協働開発**: ユーザーとClaudeによる設計・実装の協働
- **最新情報の活用**: 常に最新のドキュメントと技術情報をもとに計画・開発を進める
- **疎結合設計**: フレームワーク置き換えを容易にする技術選択
- **継続的改善**: 仕様と実装の反復的改善

### ドキュメント管理方針

- **技術詳細・開発ガイドライン**: CLAUDE.md → .claudeディレクトリに分散
- **プロジェクト概要・機能・ステータス**: README.md
- **定期的セルフレビュー**: 重要な決定後はドキュメントを自動的にレビュー・更新
- **継続性の確認**: 今回だけでなく今後も同様の指示があった場合、ドキュメント化を確認

### 品質管理方針

- **CI優先**: 手動確認を最小化し、なるべくすべてをCIで自動チェック
- **日本語ファースト**: コミットメッセージ、コメント、ドキュメントは日本語で記述
- **プルリク小分け**: レビューしやすいようにプルリクは可能な限り小分けにする

### Reactコーディングスタイル

- **関数宣言**: 可能な限りfunctionは使わず、アロー関数で書く
- **エクスポート**: 可能な限りnamed exportする
- **コンポーネント定義**:

  ```typescript
  type Props = {…}; // ファイル内に複数のコンポーネントがある場合を除き、命名は「Props」
  
  export const Component: FC<Props> = ({ … }) => {…};
  ```

- **children利用時**: PropsWithChildrenを使用

  ```typescript
  export const Component: FC<PropsWithChildren> = ({ children, … }) => {…};
  ```

- **ページコンポーネント**:

  ```typescript
  type Props = {…};
  
  const Page: FC<Props> = ({ … }) => {…}; // 誰からもimportされず、命名規則を考えるのも面倒なので、名前は全部Page、レイアウトコンポーネントはLayout
  
  export default Page;
  ```

### スタイリング方針

- **TailwindCSS**: `packages/tailwind`で共通テーマを管理
- **クロスプラットフォーム対応**: WebアプリとiOSアプリで共通テーマを参照可能

## 学習・知見

### 避けるべきパターン

現在のところ、大きな失敗や避けるべきパターンは発生していない。今後の開発で蓄積していく。

### 成功パターン

1. **技術実現可能性の事前検証**: 各技術要素について詳細な調査を実施し、実装前にリスクを洗い出し
2. **疎結合アーキテクチャ**: フレームワーク置き換えを容易にする技術選択により、将来的な変更に対応可能
3. **統合型認証**: 別途認証サーバーを立てずにHono内で完結させることで、アーキテクチャを簡素化
