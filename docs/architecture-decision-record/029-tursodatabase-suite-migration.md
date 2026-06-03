# ADR-029: @tursodatabase スイートへの移行（Local-first 実装の刷新）

## ステータス

Accepted

## 関連ADR

- [ADR-004: Turso Database](./004-turso-database.md) — 本ADRで部分Supersede（実装方法のみ）
- [ADR-006: Drizzle ORM](./006-drizzle-orm.md) — 維持（ただし内部接続経路を変更）
- [ADR-007: op-sqlite (iOS SQLiteドライバー)](./007-op-sqlite-for-ios.md) — 本ADRでSupersede
- [ADR-010: Local-first Architecture](./010-local-first-architecture.md) — 本ADRで部分Supersede（実装方法のみ）
- [ADR-021: 開発環境のTurso DB移行](./021-development-environment-turso-migration.md) — 本ADRで部分Supersede（開発環境のデータ実体を Turso Hosted から ローカル sync server に変更。命名規則と管理スクリプト体系は読み替えて継承）

## コンテキスト

ADR-004 / ADR-007 / ADR-010 の決定時点で前提だった libSQL Embedded Replicas（`@libsql/client` の `syncUrl` / `syncInterval`、および `@op-engineering/op-sqlite` の `libsqlSyncInterval`）は、Turso 公式により事実上の旧世代に位置付けられた。

### 一次情報（2026/4/24 時点）

- **公式ベンチマーク** ([turso.tech/blog/sync-benchmark](https://turso.tech/blog/sync-benchmark))
  - Sequential Inserts (3,000行): **8.9倍高速 / 16.3倍少データ**
  - Read-Your-Writes 200サイクル（バッチ push）: **312倍高速**
  - Pull Remote (5,000行): 2.1倍高速
- **公式表明**: libSQL → Turso（SQLite の Rust リライト）への全面移行を推奨。"AI エージェントが libSQL をインストールしようとしたら、Turso を使いたいと説明してください" と公式記事に明記
- **互換性** ([COMPAT.md](https://github.com/tursodatabase/turso/blob/main/COMPAT.md)): SQLite/libSQL で作成された既存DBにそのままアクセス可能。CREATE TABLE、FK、INDEX、INSERT ON CONFLICT、RETURNING、PRAGMA foreign_keys すべて対応
- **新世代 Turso Cloud** は Private Beta (2026/4/8〜) だが、**既存 Turso Hosted DB + 新クライアント**の組み合わせで本番投入可能

### 旧プロトコルの根本問題

物理ページ単位の同期のため、(1) 小さな変更でもページ全体送信、(2) コミット後の変更内容が見えずコンフリクト解決困難、(3) チェックポイントでローカル/クラウドのページ順序がズレやすく頻繁な再ブートストラップが必要、という構造的問題があった。新プロトコルは Change Data Capture (CDC) ベースで論理変更を送るため、これらが解消されている。

### 現状コードの位置付け

- `apps/ios/src/lib/database.ts`: `@op-engineering/op-sqlite@15.2.11` の `libsqlSyncInterval: 60` で旧プロトコル同期
- `packages/per-user-database/src/features/client/create-per-user-database-client.ts`: `@libsql/client@0.17.2` でリモート直接アクセス（Embedded Replicas 未使用、Web は Local-first 未達）
- `packages/per-user-database/src/testing/mocked-per-user-database.ts`: `@libsql/client` の `:memory:` でテスト
- `packages/authentication/src/helpers/get-database.ts` ほか Auth DB も `@libsql/client` 経由

### 移行の方針指針

「移行コストだけを理由に古い技術スタックを使い続けない」を明示的な指針とする。技術的制約（新パッケージで実現不可能な機能がある等）が見つかったときだけ旧採用維持を検討する。

## 論点

### 論点1: Web / サーバー側クライアント

| 案 | 概要 | Pros | Cons |
| --- | --- | --- | --- |
| **1A: `@tursodatabase/serverless` v1.1.2** | fetchベース、ゼロネイティブ依存、`@tursodatabase/serverless/compat` で `createClient({ url, authToken })` 互換 | Vercel/Edge ランタイム正式対応。最小変更で `@libsql/client` 置換可能。Turso 公式が「サーバーレス・サーバー・edge での推奨」と明示 | drizzle-orm 公式ドライバー未提供（後述・論点5） |
| 1B: `@libsql/client` 維持 | 現状維持 | 移行コストゼロ、Drizzle 公式 (`drizzle-orm/libsql`) | 公式が旧と明示。本ADR冒頭の方針と矛盾 |
| 1C: `@tursodatabase/sync` (path 必須) | ローカルレプリカを serverless 関数のエフェメラル領域に展開 | CDCベースで pull/push が高速 | Vercel serverless はリクエストごとにファイルが消える前提のため、レプリカの利点ゼロ。誤用 |

### 論点2: iOS クライアント

| 案 | 概要 | Pros | Cons |
| --- | --- | --- | --- |
| **2A: `@tursodatabase/sync-react-native` 2026/1/29 リリース** | 独立ネイティブモジュール（Android/iOS/cpp 自前）、JSI、CDC同期 | ベンチマークで圧勝。op-sqlite の制約（drizzle 経由 raw SQL の結果取得が空、`.claude/rules/op-sqlite-raw-sql.md`）が解消する見込み。RN 0.76+/New Arch 必須要件は現状（RN 0.81.5）で満たす。Expo Plugin 未提供は Expo Dev Client + prebuild ですでに運用しているため実質影響なし | drizzle-orm 公式ドライバー未提供（論点5）。op-sqlite を捨てるため移行範囲が広い。マイグレーション機能・PRAGMA は README 未文書化で実機検証必要 |
| 2B: `@op-engineering/op-sqlite` + libSQL Embedded Replicas 維持 | 現状維持 | 移行コストゼロ | 旧プロトコル。本ADR冒頭の方針と矛盾 |
| 2C: 段階的に op-sqlite を残しつつ sync 部分のみ差し替え | 不可 | — | 同一DBファイルを2つのドライバーで触る前提となり破綻 |

### 論点3: テスト用インメモリ DB

| 案 | 概要 | Pros | Cons |
| --- | --- | --- | --- |
| **3A: `@tursodatabase/database` v0.5.3 の `connect(':memory:')`**（採用時。その後 0.6.x で `prepare()` が `Promise<Statement>` を返す破壊的変更があり #869 で 0.6.1 に追従）| better-sqlite3 互換 API（async） | `:memory:` 公式対応。新スイートに統一 | drizzle-orm 公式ドライバー未提供（論点5）。`pragma()` メソッド未サポート（`exec('PRAGMA foreign_keys = ON')` で代替） |
| 3B: `@libsql/client` の `:memory:` 維持 | 現状維持 | 移行コストゼロ、Drizzle 公式 (`drizzle-orm/libsql`) | テストだけ旧スタックを残すと、本番との乖離・将来の保守負債 |

### 論点4: Auth DB（Web 経由のみアクセス）

| 案 | 概要 | Pros | Cons |
| --- | --- | --- | --- |
| **4A: `@tursodatabase/serverless` に統一** | Per-User DB と同じ Web クライアントを Auth DB にも使う | スタック統一。ユーザー方針「移行コストだけを理由に古いものを残さない」と整合 | drizzle-orm 公式ドライバー未提供（論点5） |
| 4B: Auth DB だけ `@libsql/client` 維持 | 用途が限定的（リモート直接アクセスのみ）なので残す | 移行コストゼロ | スタック分裂。ユーザー方針と矛盾 |

### 論点5: Drizzle ORM 統合（本ADR最大のリスク）

調査時点（2026/4/29）で、`drizzle-orm@0.45.2` の `src/` には `libsql/`、`op-sqlite/` のドライバーしか存在しない。`@tursodatabase/database` についてのみ Turso 公式 Drizzle ガイドが「**beta サポート**」と言及するが、コード例・import パスとも未公開。`@tursodatabase/sync`、`@tursodatabase/sync-react-native`、`@tursodatabase/serverless` の Drizzle 公式統合は確認できない。

| 案 | 概要 | Pros | Cons |
| --- | --- | --- | --- |
| **5A: `drizzle-orm/sqlite-proxy` 経由で自前ラッパー実装** | `@tursodatabase/*` の `prepare/run/get/all` を `sqlite-proxy` 規約に橋渡しする小さなアダプタ層（`packages/per-user-database/src/features/client/` 内）を書く | ロックインなし。better-sqlite3 互換 API なのでアダプタは薄い（合計500〜800行規模、トランザクション境界がメインの地雷ポイント）。drizzle-kit で生成した SQL マイグレーションはそのまま流用可能（COMPAT.md より SQL 互換） | アダプタの保守責任を負う。Drizzle 公式が出たら剥がす作業が発生 |
| 5B: Drizzle 公式対応を待つ | `@tursodatabase/database` beta が GA / 他パッケージの公式ドライバーを待ってから移行 | 接着剤コードが不要 | **事実上の全凍結**。テスト・Web・iOS のすべてが Drizzle 経由のため、Drizzle 公式対応がないとどの Phase も着手不能。Drizzle 非依存の `packages/turso/` のみ独立して進められるが、それは「もともと影響を受けない範囲」。いつ揃うか不明、Turso 側の4パッケージ分裂を Drizzle 側がフル対応する保証もない |
| 5C: Drizzle を捨てる | `@tursodatabase/sync*` のネイティブ API（`prepare/run/get/all`）を直に使う | 接着層不要、最高性能 | ADR-006（Drizzle ORM 採用）を Supersede。スキーマ・マイグレーション・型推論の置き換え影響が広範。本ADRのスコープを大きく超える |

論点5 が解決しない限り、論点1〜4 をすべて移行しても Drizzle 経由のクエリビルダーが動かない。本ADR は 5A を採用し、自前アダプタを `packages/per-user-database` 内に最小実装する前提で進める。

### 論点6: コンフリクト解決

新プロトコルのデフォルトは "**last push wins**"（Turso 公式 docs `sync/usage`、`sync/conflict-resolution` で明示）。ADR-010 の前提（LWW）と整合する。アプリ側で追加のコンフリクト戦略を実装する必要は当面ない（ワークアウトログ系は append-only で衝突確率が低く、計画系の編集は単一ユーザーが単一クライアントで行う想定）。**自動コンフリクト解決の高度化はロードマップ**である点は記録しておく。

### 論点7: 開発環境のデータ実体（ADR-021 の再評価）

ADR-021 は「Turso CLI ローカルエミュレータ」を **本番との一貫性が得られない** ことを理由に却下していた。新プロトコルでは Cloud とローカル sync server が **同一のプロトコル**（公式 docs 明記）になるため、その却下理由は消滅する。

| 案 | 概要 | Pros | Cons |
| --- | --- | --- | --- |
| **7A: ローカル sync server に切替** | `tursodb ./server.db --sync-server 0.0.0.0:8080` をローカル起動、開発DBはローカルファイル（永続化される）。クライアントは `http://localhost:8080` に接続、認証不要 | オフライン開発復活、Free 100DB枠を消費しない、テスト用 seed が容易、ADR-021 却下理由が新プロトコルで消滅 | 開発者ごとの起動セットアップが要る、Cloud 完全一致は保証外（依然エミュレータ） |
| 7B: ADR-021 維持（Hosted DB のまま） | 現状維持、開発者ごとに Hosted DB を発行 | 命名規則・管理スクリプト・本番との一貫性そのまま | オフライン開発不可、DB枠を消費し続ける |
| 7C: ハイブリッド | 通常開発はローカル sync server、preview/CI は Hosted | 両得 | 設定分岐が複雑化 |

ADR-021 が決めていた3要素のうち、本ADR が影響するのは「開発環境を Turso Hosted DB にする」点のみ。命名規則（`next-lift-dev-{developer}-auth` など）と管理スクリプト体系（`pnpm dev:db:create` 系）は、ローカル sync server に切り替わった場合は読み替えて継承する（DBファイル名規則と sync server 起動スクリプトに変換）。

### 論点8: iOS の同期発火タイミング

`libsqlSyncInterval` ベースの時間トリガ自動同期から、`pull()` / `push()` 明示呼び出しへの変更が必要。

| 案 | 概要 | Pros | Cons |
| --- | --- | --- | --- |
| A. 読みごとに pull / 書きごとに push | クエリ実行のたびに ↔ Cloud | データ最新性が常に高い | 毎回ネットワーク発生 → **ローカルファースト原則崩壊**。圏外で読みすら失敗。ADR-010 の「読みは μ秒」根拠が消える |
| B. ライフサイクルイベントトリガのみ | 起動時、フォアグラウンド復帰時、サインイン時に sync | 「画面遷移＝ローディング許容」のUX文化と整合 | 長時間同じ画面に居座ると古いデータ。書き込みのクラウド反映が遅延 |
| **C. 書き込み時 push + ライフサイクルイベントで pull** | 書き込み完了時に即 push、起動・フォアグラウンド復帰・画面 focus で pull | **ローカルファースト維持**＋書き込みの即時クラウド反映。新プロトコルのバッチpush性能（312倍）が活きる。圏外でも読み書き可、復帰時に自動リカバリ | 他デバイスでの変更は手動 pull か復帰時まで反映されない（個人開発のPer-User DB前提なので影響小） |
| D. ドメインイベントベース | 「ワークアウト完了」「計画編集確定」など意味イベントで push | ユーザーの「保存した感」と sync が一致 | イベント設計が複雑化、設計コスト増 |
| E. 時間ベース（旧仕様踏襲） | バックグラウンドタイマーで定期 sync | 挙動が変わらない | バッテリー・無駄なネットワーク。新プロトコルの恩恵が消える |
| F. 手動 sync ボタンのみ | ユーザーが押したときだけ | 完全ユーザー制御 | 押し忘れでデータ消失感、同期忘れ |

Next Lift のユースケース（メインは書き込み主体のワークアウト記録、ユーザー1人で iOS と Web 両用、圏外でも記録できる必要）を踏まえ、**C を採用**する。

具体的な発火点（実装イメージ）:

- 書き込み完了時: `await db.insert(...).values(...); await sqlite.push();`（push 失敗時もローカルには残る）
- 起動・フォアグラウンド復帰時: `AppState` の `'active'` 遷移で `sqlite.pull()`
- 画面 focus 時: `useFocusEffect` で `sqlite.pull()`

push 失敗時の再試行戦略（圏外復帰時のリカバリ）は、当面「次の書き込みに併せて push」「フォアグラウンド復帰時にも push を呼ぶ」で対応。専用 retry queue は要件が出てから実装する。

## 決定内容

論点1=1A、論点2=2A、論点3=3A、論点4=4A、論点5=5A、論点6=採用（追加実装なし）、論点7=7A、論点8=C を採用する。具体的には:

1. **Web / サーバー側**: `@libsql/client` を `@tursodatabase/serverless` に置換。当面は `/compat` の `createClient({ url, authToken })` を経由して既存コードへの影響を最小化。Auth DB / Per-User DB の Web 接続を統一。
2. **iOS**: `@op-engineering/op-sqlite` + libSQL Embedded Replicas を `@tursodatabase/sync-react-native` に置換。`syncInterval` ベースの同期から、`pull()` / `push()` を画面遷移・記録完了などのライフサイクルイベントで明示的に呼ぶ設計に変更。
3. **テスト**: `@libsql/client` の `createClient({ url: ':memory:' })` を `@tursodatabase/database` の `connect(':memory:')` に置換。`packages/per-user-database/src/testing/mocked-per-user-database.ts` ほか同等。
4. **Drizzle 接続**: `drizzle-orm/sqlite-proxy` 経由のアダプタを `packages/per-user-database/src/features/client/` 配下に新設。`@tursodatabase/serverless`（Web）、`@tursodatabase/sync-react-native`（iOS）、`@tursodatabase/database`（テスト）の3者で同一インタフェースを露出する薄い接着層を1本書く。
5. **マイグレーション**: `drizzle-kit` で生成済みの SQL マイグレーションは流用。`migrations.js`（React Native 用）も Drizzle が SQL を流す経路を保つ限り流用可能。アダプタの実装段階で実機確認する。
6. **PRAGMA foreign_keys = ON**: `pragma()` メソッドではなく `exec('PRAGMA foreign_keys = ON')` で実行。既存の ADR-026 の方針は維持。
7. **JWT トークン発行ロジック (`@next-lift/turso/issue-token`)**: 互換性が確認できているため変更しない。
8. **開発環境のデータ実体**: ローカル sync server (`tursodb --sync-server`) に切替。ADR-021 の「開発で Turso Hosted を使う」決定を本ADR で部分上書きする。命名規則・管理スクリプト体系は読み替えて継承（`pnpm dev:sync-server` 系の起動・初期化スクリプトに変換）。preview/CI は引き続き Turso Hosted を使う。
9. **iOS の同期発火タイミング**: 書き込み完了時に `push()` を即時呼び出し、起動・フォアグラウンド復帰・画面 focus 時に `pull()` を呼ぶ。`syncInterval` ベースの時間トリガは廃止。専用 retry queue は当面実装せず、次回書き込み or フォアグラウンド復帰時の再 push でリカバリする。

### 段階移行プラン

破壊的変更を一度に全 PR に詰めるとリスクが高いため、以下の順で段階的に進める。

| Phase | 範囲 | 依存 | 検証ゲート |
| --- | --- | --- | --- |
| **Phase 1: Drizzle アダプタ確立** | `drizzle-orm/sqlite-proxy` ラッパーの設計と `@tursodatabase/database` (`:memory:`) への接続。テストグリーン化 | なし | 既存テストスイートが `@tursodatabase/database` 上で全パスする |
| **Phase 2: テスト DB 置換** | `mocked-per-user-database.ts` / `mocked-authentication-database.ts` を新アダプタに切替 | Phase 1 | CI 全テストグリーン |
| **Phase 3: Web 置換** | Per-User DB / Auth DB の Web 接続を `@tursodatabase/serverless` に切替 | Phase 1 | Vercel preview で機能動作確認 |
| **Phase 4: iOS 置換** | `op-sqlite` を削除し `@tursodatabase/sync-react-native` に置換。`pull/push` を明示的な呼出しタイミングで設計 | Phase 1, 3 | Expo Dev Build で実機動作確認、コンフリクト動作確認 |
| **Phase 5: 旧依存掃除** | `@libsql/client` / `@op-engineering/op-sqlite` を依存から完全削除。Renovate ノイズ除去 | Phase 2-4 | `pnpm-lock.yaml` から旧パッケージが消えていること |
| **Phase 6: ローカル sync server への移行** | 開発環境のデータ実体を Turso Hosted から ローカル sync server に切替。`pnpm dev:sync-server` 起動スクリプト・seed/reset スクリプト整備、`.env` の URL 切替、ADR-021 の管理スクリプト名を読み替え | Phase 2, 3 | ローカルで `tursodb --sync-server` 起動 → Web/iOS から接続して E2E 動作、preview/CI は Hosted のまま動くこと |

各 Phase は独立した PR で進める（メモリルール「大きな変更作業はステップごとにコミット」「性質の異なる変更は別PR」）。

## 採用理由

1. **公式の方向性に従う**: Turso 公式が libSQL → Turso スイートへの全面移行を表明している。新規プロジェクト・既存プロジェクトとも CDC ベースの新プロトコルを推奨
2. **性能ベネフィット**: 旧 vs 新の公式ベンチで Sequential Inserts 8.9倍、Read-Your-Writes バッチ 312倍。ワークアウト記録のように「セット中はオフライン書き込みを溜め、休憩や画面遷移で push」というUXとパターンが噛み合う
3. **op-sqlite の既知制約からの脱却**: `.claude/rules/op-sqlite-raw-sql.md` に記録された「drizzle 経由 raw SQL の結果取得が空になる」という op-sqlite の制約から解放される見込み（`@tursodatabase/sync-react-native` で要実機検証）
4. **既存 Turso Hosted DB との互換性**: COMPAT.md および公式 SDK reference で確認済み。新世代 Turso Cloud (Private Beta) を待つ必要なし、既存の `next-lift-{env}-user-{hash}` DB に対してそのまま新クライアントを向ければよい
5. **JWT トークンの完全互換**: `@next-lift/turso/issue-token` の発行ロジック・トークン形式に変更不要
6. **方針との整合**: 「移行コストだけを理由に古いものを使い続けない」（メモリ: `feedback_no_legacy_for_migration_cost.md`）と整合。Auth DB だけ旧クライアント残しの折衷を避ける
7. **段階移行でリスク低減**: Drizzle アダプタを最小実装し、テスト→Web→iOS の順で破壊範囲を切り分ける
8. **オフライン開発環境の復活**: ローカル sync server 採用により、ADR-021 採用後に失われていたオフライン開発体験が戻る。Free 100DB枠の圧迫もなくなる
9. **iOS UX とローカルファースト原則の両立**: 同期発火を「書き込み即push + ライフサイクル pull」に設計することで、ADR-010 の「読みは μ秒」要件を維持しつつ、書き込みの即時クラウド反映と圏外耐性を確保

## 代替案で却下した理由

- **論点1 / 4 / 5 の "現状維持"**: 本ADR冒頭の方針（移行コストだけを理由に旧採用しない）と矛盾するため不採用。Auth DB のみ旧維持という折衷も同じ理由で却下
- **論点1C (`@tursodatabase/sync` をサーバー側で使う)**: Vercel serverless のエフェメラルファイルシステムでローカルレプリカを持つ意味がなく、誤用にあたる
- **論点2C (op-sqlite と sync-react-native の併用)**: 同一DBファイルを2ドライバーで触ることになり、ロック・トランザクション境界・PRAGMA 状態が破綻する
- **論点5B (Drizzle 公式対応待ち)**: 待つほどのリターンがない。アダプタは小さく、公式ドライバーが出たら剥がせばよい
- **論点5C (Drizzle を捨てる)**: ADR-006 を Supersede する大改修になり、本ADRのスコープを超える。Drizzle の型推論・スキーマ・マイグレーションの利益を失う
- **論点7B (ADR-021 維持)**: ADR-021 の却下理由「本番との一貫性」が新プロトコルで消滅したため、却下根拠が失われた。維持するのは合理性がない
- **論点7C (ハイブリッド)**: 通常開発と preview/CI で別構成にする設定分岐の複雑さが、ローカル sync server の利点を上回らない。preview/CI を Hosted のままにする運用は 7A でも実現できる
- **論点8A (読み書きごとに同期)**: 圏外で読み出しすら失敗するため、ADR-010（Local-first Architecture）の中核要件と矛盾する
- **論点8E (時間ベース継続)**: 新プロトコルの低オーバーヘッドな性質（小さな変更を即座に push できる）を時間トリガで打ち消すのは設計として後退

## 結果・影響

### メリット

- 公式推奨の新プロトコルへの追従。今後12ヶ月で陳腐化が確実な選択を捨てる
- iOS の同期性能が桁違いに向上する見込み（実機ベンチで要検証）
- op-sqlite の raw SQL 取得バグから解放される見込み
- Auth DB / Per-User DB / テスト DB のスタックが `@tursodatabase/*` に一本化
- ADR-007 を Supersede し、ADR-004 / ADR-010 の実装メモを最新化することで、コードと ADR の整合が回復

### デメリット・リスク

- Drizzle 公式ドライバーがないため `drizzle-orm/sqlite-proxy` ラッパーを自前で保守する。Drizzle 公式対応が出たら剥がす作業が発生
- `@tursodatabase/sync-react-native` の README にマイグレーション・PRAGMA の言及が乏しく、Phase 1 で実機検証が必須
- iOS の同期発火タイミングを論点8で C 案（書き込み即push + ライフサイクル pull）に決定済み。実装段階で `AppState` 連携・`useFocusEffect` 連携・push 失敗時の挙動を詰める
- 自動コンフリクト解決の高度化は新プロトコル側のロードマップ（[libSQL issues `offline writes` ラベル](https://github.com/tursodatabase/libsql/issues?q=state%3Aopen%20label%3A%22offline%20writes%22)）。当面 LWW で問題ない設計を維持するが、将来 collaborative 編集を入れるなら再設計が要る

### 波及範囲（実装着手時に確定する見込み）

- `apps/ios/src/lib/database.ts` 全面書き換え（`openSync` → `Database` クラス、`libsqlSyncInterval` 削除、`pull/push` 明示呼出し）
- `apps/ios/src/lib/database-context.tsx` の sync インタフェース変更（`sync()` 単発から `push()` / `pull()` 分離）
- `apps/ios/src/components/home-screen.tsx` の sync 呼出し箇所、および `AppState` / `useFocusEffect` 連携の追加
- `apps/ios/package.json` から `@op-engineering/op-sqlite`、`drizzle-orm/op-sqlite` 関連の整理。`@tursodatabase/sync-react-native` 追加
- `packages/per-user-database/src/features/client/create-per-user-database-client.ts`（Web 用クライアント生成）を `@tursodatabase/serverless` ベースに変更
- `packages/per-user-database/src/features/client/` に `drizzle-orm/sqlite-proxy` ラッパー新設
- `packages/per-user-database/src/testing/mocked-per-user-database.ts`、`packages/authentication/src/testing/mocked-authentication-database.ts`、`packages/authentication/src/development/apply-auth-migration.ts`、`packages/authentication/src/helpers/get-database.ts` を新アダプタ経由に切替
- `packages/per-user-database/package.json` / `apps/web/package.json` / `packages/authentication/package.json` から `@libsql/client` を削除、`@tursodatabase/serverless` / `@tursodatabase/database` を追加
- `docs/architecture-decision-record/overview.md` のアーキテクチャ図と技術スタック節を更新
- `docs/architecture-decision-record/004-turso-database.md` / `010-local-first-architecture.md` の実装方法節に本ADRへの参照を追加
- `docs/architecture-decision-record/007-op-sqlite-for-ios.md` のステータスを `Superseded by ADR-029` に変更
- `docs/architecture-decision-record/021-development-environment-turso-migration.md` に `Partially Superseded by ADR-029 (development environment data location only)` の注記を追加
- `apps/web/.env.example` / 開発者向け環境変数ドキュメントの URL 切替ガイド更新
- `package.json` のルート scripts に `dev:sync-server` 系（ローカル sync server 起動・seed・reset）の新設、ADR-021 で導入した `dev:db:create` 系の役割再定義
- `.claude/rules/op-sqlite-raw-sql.md` は op-sqlite を撤去するタイミングで削除

各 Phase の詳細タスク分解は本ADR受理後に `/breakdown` で行う。

## 決定日

2026-04-29
