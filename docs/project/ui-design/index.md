# Next Lift UI設計

## ステータス

- 現在のフェーズ: 7/7（ドキュメント分割完了）
- ユースケース数: 27
- Feature数: 5
- Function数: 28
- 概念オブジェクト数: 9
- 単位ビュー数: 14
- 次のアクション: 実装フェーズへ

## 要件サマリー

- システム名: Next Lift
- 対象プラットフォーム: iOS（React Native / Expo）、Web（Next.js）
- 対象フォームファクタ: モバイル（iOS）+ デスクトップ/レスポンシブ（Web）
- 入力資料:
  - ペルソナモデル: docs/project/ui-design/persona-model.md
  - 行動シナリオ: docs/project/ui-design/behavioral-scenarios.md
  - プロジェクト概要: docs/project/overview.md
- 外部サービス依存: Turso（Per-User Database）、Better Auth（認証）
- コードベース調査結果:
  - ADR-014: Intent UI（React Aria Componentsベース）を採用。アクセシビリティとAI Agent操作を重視。copy-and-ownモデル
  - ADR-015: Tailwind CSS v4を採用。Intent UIと組み合わせ使用
  - ADR-001: React Native（Expo）でiOSアプリを開発
  - UIコンポーネントは packages/react-components/ に共通化

## ファイル一覧

| ファイル | 内容 | 利用シーン |
|---------|------|-----------|
| [design-principles.md](./design-principles.md) | コンセプト定義、メンタルモデル | 実装を始めるとき最初に読む。設計の「なぜ」と「どういう体験を目指すか」を理解する |
| [domain-model.md](./domain-model.md) | ユースケース一覧、タスク表、コンテンツ構造 | ドメインオブジェクトの構造を確認するとき読む。「何が存在し、どう関連するか」を理解する |
| [views-and-navigation.md](./views-and-navigation.md) | フレーム構造、ナビゲーション構造 | 特定のビューを実装するとき読む。「何をどこに置き、どう遷移するか」を理解する |
| [design-decisions.md](./design-decisions.md) | 設計判断ログ | 「なぜこの設計になっているのか」を調べるとき読む。オンデマンドで参照する |

## 実装時の確認事項

### NOTE-1: V15（Day種目推移）の表示形式は未確定

V15はWeb限定のビューで、表示形式（オーバーレイ、サイドパネル等）がPhase 5で「プラットフォーム適合フェーズで確定する」と記載されている。本プロセスにプラットフォーム適合フェーズは含まれないため、実装時に確定する必要がある。

### NOTE-2: アドホックワークアウト（Day紐づけなし）のUI詳細

ワークアウト→Dayの多重度が0..1（設計判断#20）であり、Dayに紐づかないアドホックワークアウトが存在する。V5+V8（ワークアウト開始+履歴）でプログラム/Day選択をスキップしてアドホックワークアウトを開始する操作の詳細はフレーム構造で明示されていない。実装時にUI詳細を確定する必要がある。

### NOTE-3: 空状態のコンテンツ設計

コンセプト定義で「初回はサンプルコンテンツで『触って発見』させる。空になったら構造とラベルで導く」と記載されている。サンプルコンテンツの具体的な内容（サンプルプログラム、サンプル種目等）は実装時に確定する必要がある。

### NOTE-4: e1RM自動算出のFunction配置

e1RM自動算出（UC_E_1）は1RM Featureのタスク表に配置されている。設計判断#19でe1RMは概念オブジェクトではなく導出ビューに変更されたため、CRUDを「C」（Create）から「R」（セット記録からの読み取り・算出）に変更した（設計判断#52）。e1RM採用（UC_D_2）で1RMに反映される前段処理として1RM Featureに配置されていることは合理的であり、現状の配置で問題はない。
