# ADR-008: Vercel Deployment

## ステータス

Accepted

## コンテキスト

Next.js (Web App + API）のデプロイ先を選定する必要があった。以下の要件があった:

- Next.jsを使う上で相性が良い
- Better Auth + Tursoの動作実績がある
- セットアップが簡単
- 無料で開始できる
- 学習コストを最小化

## 決定内容

デプロイ先として**Vercel**を採用する。

### 利用プラン

- **初期**: Hobby Plan（無料）
- **スケール時**: 必要に応じてPro Plan検討

## 結果・影響

### メリット

- Next.js開発元の公式プラットフォームで最高の開発体験
- ゼロコンフィグデプロイ
- Better Auth + Tursoの動作実績あり（Vercelテンプレート存在: "Turso Per User Starter")
- Preview Deployments（PR毎に自動デプロイ）
- 無料枠（Hobby Plan）が個人開発に十分
  - Serverless Function: 150,000 invocations/月
  - Bandwidth: 100 GB/月
  - Build Minutes: 6,000分/月

### デメリット

- スケール時に料金が高くなる可能性（Pro Plan: $20/ユーザー/月）
- ベンダーロックインのリスク（Vercel特化機能を使った場合）
- ランダムなコールドスタート

### 注意点

- **Preview DeploymentsでBetter AuthのCORS問題**
  - ランダムURLが生成されるため、`trustedOrigins`設定が必要
  - 解決策: `VERCEL_URL`環境変数を使用

## 代替案

以下の選択肢を調査した:

### Cloudflare Workers (+ OpenNext)

- **メリット**:
  - 圧倒的に安い（Vercelの1/10以下）
  - 高速（エッジネットワーク）
  - Tursoと相性良好（エッジ × エッジ）
- **却下理由**:
  - **OpenNextセットアップが複雑**(数日かかる可能性）
  - Next.js最新機能の対応遅れ
  - Workers制約（サイズ制限: Free 3MiB、Paid 10MiB）
  - 個人開発でOpenNextセットアップに数日は厳しい
  - ネイティブアプリ開発初心者には学習コスト高すぎ
  - **つらさ**: ⭐⭐⭐⭐

### Railway

- **メリット**:
  - 使用量ベース課金（公平）
  - Serverless機能（自動スリープでコスト削減）
- **却下理由**:
  - **Free Tierなし**(2023年8月に廃止）
  - 最初から課金が必要
  - 個人開発の初期段階では無料で始めたい
  - **つらさ**: ⭐⭐

### Render

- **メリット**:
  - Free Tierあり
  - 予測可能な料金（サーバーフルモデル）
- **却下理由**:
  - **Free Tierの制約**(15分間アクセスなしで自動停止）
  - 開発に不便
  - Vercelより開発体験が劣る
  - **つらさ**: ⭐⭐

## トレードオフ

Vercelは以下のトレードオフを伴う:

- ✅ 最高の開発体験、簡単、無料、実績あり
- ❌ スケール時に料金高（ただし、その時点で移行検討可能）

個人開発で料金が問題になるほどスケールする可能性は低く、もしスケールした場合は（嬉しい悲鳴）その時点でCloudflare WorkersやRenderへの移行を検討すれば良い。

## 料金の見込み

- **現実的なユーザー数**: 500ユーザー以下
- **Function invocations**: 150,000/月は過剰（無料枠で十分）
- **Next Liftのスケール**(最大10,000ユーザー）でもおそらく無料枠内

## 決定日

2025-10-19
