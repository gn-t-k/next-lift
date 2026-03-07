# 要件定義: iOS環境変数バリデーション

関連Issue: #553

## 背景

Web側では `@next-lift/env` パッケージにより、Zodスキーマベースの環境変数バリデーションが整備されている（static/dynamic × private/publicの4分類、型安全なアクセス、`pnpm --filter @next-lift/env check` による事前検証）。一方、iOS（React Native/Expo）側には同等の仕組みがなく、手動のnullチェックのみで設定ミスを事前に検知できない。

### 現状

- iOS側の環境変数は3つ: `EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`, `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`
- 各ファイルで個別に `process.env["EXPO_PUBLIC_*"]` を参照し、手動でnullチェック
- Zodスキーマによるバリデーションなし
- Turso接続情報はサーバーAPIから動的に取得し、`credentialsSchema`（Zod）で既にバリデーション済み

## 要望（Goals）

- iOS側で環境変数の設定ミスを可能な限り早い段階で検知したい

## 要求（Requests）

- Zodスキーマベースのバリデーションを導入する（→ 設定ミスの早期検知）
- `@next-lift/env` のスキーマ共有を検討する（→ Web/iOS間の一貫性）

## 調査結果

### コードベース調査

- **`@next-lift/env`の構造**: static/dynamic × private/publicの4分類でZodスキーマを定義。Proxyパターンでlazyバリデーションを実現。`pnpm --filter @next-lift/env check` で全環境変数を事前検証
- **Web側check**: `@praha/byethrow`のROPパターンで実装。CI/CD（プレビュー・本番デプロイ）のパイプラインで実行
- **iOS環境変数の使用箇所**: `auth-client.ts`（API_URL）、`get-google-id-token.ts`（Google Client IDs）の2ファイル
- **Expoの環境変数管理**: `EXPO_PUBLIC_*` はMetroがビルド時にインライン展開。`.env` はmonorepoルートからsymlink
- **EAS Build**: secretsは未使用、monorepoの`.env`をsymlink参照
- **Turso credentials**: サーバーAPIから動的取得→Expo Secure Storeにキャッシュ。iOS側で独自の`credentialsSchema`でバリデーション済み
- **iOS側のstatic/dynamic区別**: `EXPO_PUBLIC_*`はすべてMetroがビルド時にインライン展開するため、Web側のようなstatic/dynamic分離は不要

### 実現可能性の評価

| 要望/要求 | 実現可能性 | 根拠 | 備考 |
| --- | --- | --- | --- |
| Zodスキーマベースのバリデーション | 可能 | Web側で実績あり、iOS側も同じZodが使える | |
| `@next-lift/env` のスキーマ共有 | 不採用 | Web(サーバーサイド秘密情報)とiOS(EXPO_PUBLIC_*)で変数が完全に異なり、共有メリットが薄い | iOS専用の仕組みとする |

## 要件（Requirements）

### 機能要件

- [ ] iOS側の環境変数をZodスキーマで定義し、型安全にアクセスできる仕組みを作る
  - 対象変数: `EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`, `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`
  - 将来の環境変数追加に対応しやすい構造にする
- [ ] プレビルドスクリプトでビルド前にバリデーションを実行できるようにする
  - `apps/ios/package.json` に `check` スクリプトを追加
  - `.env` ファイルをZodスキーマで検証し、不正な場合はエラーメッセージを表示して終了
- [ ] モジュールimport時にもバリデーションを実行する（安全網）
  - envモジュールをimportした時点でZodによる検証が走る
  - 既存の手動nullチェックを置き換える
- [ ] 既存のenvアクセス箇所（`auth-client.ts`、`get-google-id-token.ts`）をenvモジュール経由に変更する

### 非機能要件

- [ ] `apps/ios` 内に配置する（現時点で`apps/ios`からのみ参照されるため。将来packagesから参照が必要になった時点でpackageに切り出す）
- [ ] `@next-lift/env` パッケージには依存しない（Web/iOSで環境変数が完全に異なるため）
- [ ] Web側の `@next-lift/env` の設計思想（Zodスキーマ定義 + バリデーション + 型安全なアクセス）に倣う

### スコープ外

- `@next-lift/env` パッケージの変更・拡張: Web/iOS間で共有する変数がないため
- Turso credentials のバリデーション: 既にZodで検証済み
- EAS Build CI/CDパイプラインへの統合: 今回はスクリプトの作成まで。CI/CD統合は別タスク
- `app.config.ts` への変換: 現在の `app.json` で十分

## 議論ログ

### ラウンド1: スコープと方針の確認

- 論点: バリデーションのスコープ、パッケージ構成、検証タイミング
- 選択肢と判断:
  - スコープ: 「EXPO_PUBLIC_* + 将来の拡張性も考慮」を選択
  - パッケージ構成: 「iOS専用の仕組みを作る」を選択（Web/iOSで変数が完全に異なるため）
  - 検証タイミング: 「両方（プレビルドスクリプト + モジュールimport時）」を選択
- 理由: 可能な限り早い段階（ビルド前）で検知しつつ、スクリプトをスキップした場合の安全網も確保

### ラウンド2: 配置の判断

- 論点: iOS環境変数のバリデーションを`apps/ios`内に置くか、`packages/`に切り出すか
- 調査結果:
  - `@next-lift/env`がpackageなのは、`packages/authentication`・`packages/turso`・`packages/per-user-database`・`apps/web`の4箇所から参照されるため
  - iOS環境変数は`apps/ios`内の2ファイルからのみ参照。既存のpackagesはすべてサーバーサイドで`EXPO_PUBLIC_*`を参照しない
- 判断: `apps/ios`内に作る（YAGNI。将来必要になった時点でpackageに切り出す）

## 合意事項

- [x] ユーザー承認済み
