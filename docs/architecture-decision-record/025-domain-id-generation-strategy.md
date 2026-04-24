# ADR-025: ドメインデータのID生成戦略

## ステータス

Accepted

## コンテキスト

アプリケーションコードが作成するレコード（Better Auth自動生成テーブルを除く、ドメインで意味を持つID）のID生成方法を統一する必要がある。

既に `packages/utilities/src/generate-id.ts` に `generateId`（`nanoid` の `customAlphabet` による 36進12文字のランダムID）が存在し、`packages/authentication/src/features/user-database-credentials/helpers/upsert-credentials.ts` の1箇所で使用されている。ただし、この関数を追加したコミット（`a858203`）は `barrel export 廃止` の refactor が主目的で、ID戦略に関する設計議論の記録はない。

Per-User Database のドメインスキーマ実装（15テーブル、全テーブルに `text` PK）にあたり、ID生成戦略を全ドメインテーブルで統一するため、正式に意思決定を記録する。

### 要件と制約

- **対象範囲**: アプリコードが生成するIDのみ。Better Authが自動生成するID（`user.id`, `session.id`等）は対象外
- **DB構成**: SQLite (Turso on Web / op-sqlite on iOS) を前提
- **データ規模**: Per-User Database は1ユーザー1DB。1ユーザーあたりのレコード数は数万行オーダー（個人トレーニングアプリ）
- **時系列性**: ERDでは `display_order`、`started_at`、`registered_at` 等のドメインタイムスタンプを独立カラムで保持するため、IDに時系列ソート性を求める動機は弱い
- **クライアント生成**: iOS/Web双方のクライアントコードがID生成する可能性があるため、DBサーバー側のシーケンス依存は避ける

### 候補

| 候補 | 特徴 | 本件での評価 |
| --- | --- | --- |
| **nanoid 36進12文字**（既存 `generateId`） | 約62bitランダム。ソート不可。文字列12桁 | Per-User DB規模では衝突確率実用上ゼロ。既存実装と使用箇所が既にあり、新規依存不要 |
| **UUID v7** | 時系列ソート可能。36文字。広く認知 | 長い。ERD側でタイムスタンプを別カラムで保持しているため時系列性の価値が相対的に低い |
| **ULID** | 時系列ソート可能。26文字 Crockford Base32 | 同上。ライブラリ追加が必要 |
| **cuid2** | 衝突耐性の高い短縮ID | 特別な優位性なし。ライブラリ追加が必要 |

## 決定内容

**`packages/utilities/src/generate-id.ts` の `generateId` を、アプリコード管理ドメインIDの標準生成手段とする。**

- Per-User Database の全15テーブルの `id` カラムはこの `generateId()` の戻り値を保存する
- Authentication パッケージの `per_user_database` テーブル等、既に使用している箇所はそのまま維持
- 新規のドメインテーブルでID生成が必要な場合も、原則 `generateId` を使用する

### 採用理由

1. **既存実装との一貫性**: 既に本番コード（`upsert-credentials`）で使用されており、新ライブラリの追加は不要
2. **Per-User DB の規模に十分**: 36進12文字（約4.7×10¹⁸通り）は1ユーザーDBの規模（数万行）に対して衝突確率実質ゼロ
3. **時系列性は別カラムで表現**: ERD設計（`docs/project/erd-design/schema.md`）で `display_order` やドメインタイムスタンプを独立カラムに保持しているため、IDに時系列ソート性を組み込む必要がない
4. **クライアント生成フレンドリー**: ランダムIDなのでDBサーバー側のシーケンスに依存せず、iOS/Web双方のクライアントで独立生成可能
5. **既存generate-idは暗号学的強度不要**: IDは推測困難性が要件ではなく一意性のみが要件

## 結果・影響

### メリット

- 既存のID生成ヘルパーを全ドメインコードで再利用でき、依存関係が1箇所に集約される
- 新ライブラリ導入なし
- Per-User DB・Authentication DB・今後の他DBで同じ関数を使えるため、コーディング時の迷いが減る

### デメリット

- **IDに時系列情報が含まれない**: 作成順にソートしたい場合はドメインタイムスタンプカラム（`started_at` 等）でORDER BYする必要がある。Per-User DB のERDは既にそれらを保持しているため実害はない
- **IDでのB-tree局所性なし**: UUID v7 / ULIDのような「直近INSERTのIDが近い値になる」局所性はない。Per-User DB規模ではI/O性能問題は発生しない前提
- **グローバル横断でのソート不可**: 複数DBのレコードをIDだけでマージソートできないが、本プロジェクトのアーキテクチャではそうした要求がない

### 波及範囲

- Per-User Database のdrizzleスキーマ実装（全15テーブル）で `generateId()` を使用する
- 将来 Authentication DB に新テーブルを追加する場合も原則 `generateId()` を使用する
- ID長（12文字）がドメイン要件で不足すると判明した場合、`generate-id.ts` の `ID_LENGTH` を引き上げて対応する（文字空間は同じでも衝突耐性を上げられる）

## 代替案

### 1. UUID v7 への乗り換え

時系列ソート可能な128bit IDに統一する方式。

**却下理由**: 時系列ソートの必要性がERD上の他カラムで代替可能であり、12文字から36文字への肥大化に見合う利点がない。既存 `generateId` 使用箇所の差し替えコストも発生する。

### 2. ULID

時系列ソート可能かつ UUID より短い（26文字）方式。

**却下理由**: UUID v7 と同じ議論が当てはまる。加えて新規ライブラリ追加が必要。

### 3. テーブルごとに戦略を変える

ホットパスは UUID v7、それ以外は nanoid 等の混在運用。

**却下理由**: 混在は認知負荷が高く、本プロジェクト規模で戦略を分ける利益がない。

## 決定日

2026-04-24
