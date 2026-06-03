# ADR-030: Expo SDK の手動アップグレード方針と Renovate 設定

## ステータス

Accepted

## コンテキスト

`apps/ios` は Expo を採用している（[ADR-001](./001-react-native-for-ios.md)）。

Expo SDK は `bundledNativeModules.json` で `react-native` / `react` をはじめとする各ライブラリのバージョンを固定する。これは「この SDK バージョンにはこの react-native」という SDK ↔ ネイティブの互換マトリクスであり、固定されたバージョンの組み合わせでのみネイティブビルドの互換性が保証される。

一方で Renovate には Expo の first-class サポートが無い。

- 更新時に `expo install` を使わず、通常の install 相当でバージョンを解決する
- Expo の `bundledNativeModules.json` を参照しない

このため Renovate は `expo` だけを単独で bump し、その SDK が要求する `react-native` への更新を含まない**不完全なアップグレード PR** を生成する（例: #697 expo 54→55）。この PR は単体ではマージできず、マージするとネイティブビルドが壊れる。

この方針は従来コミット `bcf39e5`（"improve: Reactバージョン管理の整理"）のコミットメッセージと `renovate.json` のコメントにしか残っておらず、コードに現れない設計判断であるため ADR として明文化する。

## 決定内容

### 1. Expo SDK のアップグレードは手動で行う

`expo` + `react-native` + `react` + ネイティブプロジェクト（prebuild / pod）をまとめて、Expo 公式ツールを用いて 1 SDK ずつ実施する。

- `npx expo install --fix`（SDK が固定するバージョンへ依存を揃える）
- `npx expo-doctor`（互換性チェック）
- 公式の Upgrade ガイドに従い、サードパーティライブラリ・config plugin・ネイティブ設定を個別に確認する

### 2. Renovate は「不完全なアップグレードを防ぐ」役割に徹する

`renovate.json` の `packageRules` で以下を定義する。

- `apps/ios` の `react` / `react-dom` / `react-native` / `@types/react` は自動更新を無効化（`enabled: false`）し、SDK が固定するバージョンに固定する
- `apps/ios` の `expo` / `expo-*` は `groupName: "expo SDK (ios)"` で1つのグループ PR にまとめる。このグループ PR は**自動マージせず**、手動 SDK 移行の起点（=新 SDK が出たことの通知）として扱う

### 3. SDK アップグレード自体の自動化はしない

Renovate で SDK アップグレードを完結させる仕組みは現時点で存在しない。Expo の公式サポートが入るまでは、上記の手動運用を前提とする。

## 結果・影響

### メリット

- `react-native` が SDK と無関係に bump されてネイティブビルドが壊れることを防げる
- `expo` 単独の不完全な major PR が「expo SDK (ios)」グループとして1つにまとまり、手動アップグレードの起点として扱いやすくなる
- 手動アップグレードという運用判断が ADR として残り、将来同じ調査を繰り返さずに済む

### デメリット

- SDK アップグレードは all-or-nothing の手動作業になり、自動化の恩恵を受けられない
- 新 SDK がリリースされても自動では追従しないため、定期的に手動で追従する運用が必要
- SDK を上げる際は `renovate.json` の固定対象（react / react-native）も手動で見直す必要がある

## 代替案

### 案A: `expo` / `expo-*` も自動更新を無効化する

- **却下理由**: 設定は単純になるが、新 SDK がリリースされたことに気づく手段（通知 PR）が無くなる。グループ PR を「SDK が出た合図」として残す案B のほうが運用上の見通しが良い。

### 案B'（不採用の派生）: `allowedVersions` で react-native を SDK バージョンに厳密ピンする

- **却下理由**: より明示的だが、SDK アップグレードのたびに `allowedVersions` の値を手で更新する保守コストが発生する。`enabled: false` でも「SDK 固定のため自動更新しない」という意図は表現でき、保守が軽いため `enabled: false` を採用した。

### 案C: GitHub Actions で `expo` のアップグレードコマンドを定期実行する

- **却下理由**: ネイティブの prebuild / pod / config plugin の確認は機械的に完結できず、結局人手のレビューが必要になる。自動化の効果が薄く、運用が複雑になる。

## 決定日

2026-06-03

## 参考

- [Renovate Discussion #24735: Using on Expo project](https://github.com/renovatebot/renovate/discussions/24735)
- [Expo Documentation: Upgrade Expo SDK walkthrough](https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/)
- 関連 ADR: [001](./001-react-native-for-ios.md) / [007](./007-op-sqlite-for-ios.md) / [029](./029-tursodatabase-suite-migration.md)
