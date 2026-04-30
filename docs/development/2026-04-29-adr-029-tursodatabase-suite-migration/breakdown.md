# Breakdown: ADR-029 @tursodatabase スイート移行

## ステータス

- 状態: 確定
- 現在のフェーズ: 5/5（完了）
- 葉タスク: 70件（Phase 1: 8, Phase 2: 8, Phase 3: 10, Phase 4: 19, Phase 5: 9, Phase 6: 16）
- 未展開ノード: 0件
- 最終更新: 2026-04-30

## 要件サマリー

- 要件ドキュメント: [docs/architecture-decision-record/029-tursodatabase-suite-migration.md](../../architecture-decision-record/029-tursodatabase-suite-migration.md)
- スコープ: ADR-029 の段階移行プラン Phase 1〜6 全体
  - Phase 1: Drizzle アダプタ確立（`drizzle-orm/sqlite-proxy` ラッパー）
  - Phase 2: テスト DB 置換（`@libsql/client :memory:` → `@tursodatabase/database`）
  - Phase 3: Web 置換（`@libsql/client` → `@tursodatabase/serverless`）
  - Phase 4: iOS 置換（`@op-engineering/op-sqlite` + libSQL Embedded Replicas → `@tursodatabase/sync-react-native`、同期発火タイミングの設計変更含む）
  - Phase 5: 旧依存掃除
  - Phase 6: 開発環境のデータ実体をローカル sync server に切替

## 設計概要

### 影響範囲

- **apps/web**: `src/app/api/per-user-database/credentials/route.ts` 経路の動作確認、`.env.example` の URL 切替ガイド
- **apps/ios**: `src/lib/database.ts` 全面書き換え、`src/lib/database-context.tsx` の sync インタフェース変更、`src/components/home-screen.tsx` の sync 呼出し再設計、`AppState` / `useFocusEffect` 連携
- **packages/per-user-database**: `src/features/client/create-per-user-database-client.ts` 置換、`src/features/client/` 配下に `drizzle-orm/sqlite-proxy` アダプタ新設、`src/testing/mocked-per-user-database.ts` 置換、`package.json` 依存差し替え
- **packages/authentication**: `src/helpers/get-database.ts` 置換、`src/development/apply-auth-migration.ts` 置換、`src/development/cli/{create,destroy,reset}.ts` 置換、`src/testing/mocked-authentication-database.ts` 置換、`package.json` 依存差し替え
- **packages/turso**: 変更なし（JWT 発行ロジックは互換）
- **データベーススキーマ**: 変更なし（COMPAT.md より SQL 互換）
- **外部API連携**: Turso Hosted DB は変更なし（preview/CI で継続使用）。ローカル sync server を開発環境に追加
- **マイグレーション**: `drizzle/0000_*.sql` 〜 `drizzle/0002_*.sql` および `drizzle/migrations.js` は流用
- **ドキュメント**: ADR-004 / ADR-007 / ADR-010 / ADR-021 のステータス・参照更新、overview.md 更新
- **ルール**: `.claude/rules/op-sqlite-raw-sql.md` 削除

### アプローチ

- **新規モジュール追加**: `packages/per-user-database/src/features/client/` 配下に `drizzle-orm/sqlite-proxy` ベースの薄いアダプタ層を新設し、3 ドライバー（`@tursodatabase/serverless` / `@tursodatabase/sync-react-native` / `@tursodatabase/database`）を統一インタフェースで露出させる
- **既存モジュール置換**: 上記アダプタ経由で各環境の DB クライアント生成ロジックを差し替える（破壊的変更）
- **段階移行**: Phase 1（アダプタ確立）→ 2（テスト）→ 3（Web）→ 4（iOS）→ 5（旧依存掃除）→ 6（ローカル sync server）の順で独立 PR として進める

### 関連ADR

- 本ADR: [ADR-029](../../architecture-decision-record/029-tursodatabase-suite-migration.md)
- 部分Supersede対象: ADR-004 / ADR-010 / ADR-021
- 全面Supersede対象: ADR-007
- 維持: ADR-006（Drizzle ORM）

## タスクツリー

凡例:
- `[?]` 未展開（さらに分解が必要） — 本ツリーには現在残っていない
- `[ ]` 葉タスク（TDDで着手可能）
- `[x]` 完了
- マークなしの番号付きノードは中間カテゴリ（葉タスクのグルーピング）

依存関係: Phase 1 → Phase 2 / Phase 3（並行可） → Phase 4 → Phase 5 → Phase 6 の順で実装する。Phase 6 は Phase 2-3 完了後に着手可能。

### Phase 1: Drizzle アダプタ確立

`drizzle-orm/sqlite-proxy` ベースのラッパーを `packages/per-user-database/src/features/client/` 配下に新設し、`@tursodatabase/database`（`:memory:`）への接続でテストグリーン化までを行う。後続 Phase の土台。

- 1.1. `@tursodatabase/database` のインストールと sqlite-proxy アダプタの新設
  - [ ] 1.1.1. `@tursodatabase/database` を `packages/per-user-database` に追加
    - 説明: `pnpm add @tursodatabase/database@<最新>` を `packages/per-user-database` 配下で実行する。バージョンは `npm view @tursodatabase/database version` で確認する
    - 完了条件:
      - 確認: `packages/per-user-database/package.json` の dependencies に厳密バージョンで記載されること（レンジ指定なし）
      - 確認: `pnpm-lock.yaml` に追加されていること
  - [ ] 1.1.2. `connect(':memory:')` で SQL を直接実行できる薄い helper の作成
    - 説明: `packages/per-user-database/src/features/client/` 配下に、`@tursodatabase/database` の `connect()` をラップして `prepare/run/get/all` を露出する関数を作る。マイグレーション SQL を `exec` できることを最小目標とする
    - 完了条件:
      - テスト: `connect(':memory:')` で得たハンドルに対し `CREATE TABLE` → `INSERT` → `SELECT` が一連で成功すること
      - テスト: `exec('PRAGMA foreign_keys = ON')` 実行後に FK 制約違反が `RESULT` で失敗すること
  - [ ] 1.1.3. `drizzle-orm/sqlite-proxy` 用の `proxyExecute` / `proxyTransaction` 実装
    - 説明: drizzle が要求する `(sql, params, method) => Promise<{rows: ...}>` の形に、1.1.2 の helper を橋渡しする関数を実装する。`method` ごとの `run`/`get`/`all`/`values` を分岐
    - 完了条件:
      - テスト: `method === "all"` で複数行が `rows: any[][]` 形式で返ること
      - テスト: `method === "get"` で単一行（または undefined）が返ること
      - テスト: `method === "run"` で `rowsAffected` 等の戻り値が drizzle 期待形式で返ること
      - テスト: パラメータバインディング（`?` 経由）が正しく置換されること
  - [ ] 1.1.4. drizzle トランザクション境界の sqlite-proxy 対応
    - 説明: sqlite-proxy のトランザクションコールバックを `BEGIN` / `COMMIT` / `ROLLBACK` に翻訳し、ネスト時に SAVEPOINT を発行する。アダプタ最大の地雷ポイント（ADR 5A 注記）
    - 完了条件:
      - テスト: 単一トランザクションで途中エラー → ROLLBACK され副作用が残らないこと
      - テスト: ネストトランザクション内側 ROLLBACK → 内側のみ巻き戻り外側は継続できること
      - テスト: 正常終了で COMMIT され副作用が確定すること

- 1.2. アダプタを drizzle インスタンスに統合する関数の作成
  - [ ] 1.2.1. `createDatabaseFromTursoDatabase` ヘルパーの作成
    - 説明: `@tursodatabase/database` の `connect(':memory:')` で得たハンドルを `drizzle-orm/sqlite-proxy` に渡し、`packages/per-user-database/src/database-schemas` の型推論を保ったまま `BetterSQLite3Database<typeof schema>` 互換の drizzle インスタンスを返すヘルパーを作る
    - 完了条件:
      - 型: 戻り値が `packages/per-user-database` のスキーマ型に完全に合致すること（`.select().from(programs)` の戻り値型が現状と同じ）
      - テスト: 戻り値の drizzle インスタンスでスキーマ経由 `.select().from(programs)` が空配列を返せること（マイグレーション後）
  - [ ] 1.2.2. アダプタ向け `applyMigrations` ユーティリティ整備
    - 説明: drizzle-orm が生成した SQL マイグレーション（`drizzle/0000_*.sql` 〜 `0002_*.sql`）を 1.2.1 の drizzle インスタンスに適用する関数を作成。`drizzle-orm/expo-sqlite/migrator` 相当の経路を sqlite-proxy 上で再現
    - 完了条件:
      - テスト: 空 DB に適用後、`programs` / `days` / `exercises` / `workouts` 等の主要テーブルが存在し、`PRAGMA foreign_keys` が ON になっていること
      - テスト: 既に適用済みの DB に再適用しても副作用がないこと（冪等）

- 1.3. アダプタ経由で既存テストスイートが緑になる確認
  - [ ] 1.3.1. per-user-database のスキーマ単体テストをアダプタで動かす検証
    - 説明: 既存の `mocked-per-user-database.ts` を直接書き換えるのは Phase 2。本タスクでは Phase 1 のアダプタを利用する独立した検証用 setup（テストフィクスチャ）を作って、いずれか 1 つの統合テストファイルをアダプタ経由で実行する
    - 完了条件:
      - テスト: 対象テストファイルが新アダプタ経由で全グリーンになること
      - テスト: drizzle-factory（`@praha/drizzle-factory`）で生成したデータが INSERT 経路で永続することを最低 1 ケース確認
  - [ ] 1.3.2. アダプタの既知制約とトレードオフのドキュメント化
    - 説明: `packages/per-user-database/src/features/client/` のアダプタ実装ファイルの先頭コメント、または `README.md`（既存があれば追記）に、Drizzle 公式対応待ちで自前保守する旨と剥がし方の方針を 1 段落で記録
    - 完了条件:
      - 確認: アダプタファイル先頭または README に「Drizzle 公式ドライバーが提供されたら剥がす」「現状のスコープは sqlite-proxy 経由の橋渡しのみ」が記述されていること



### Phase 2: テスト DB 置換

per-user-database / authentication の in-memory テスト DB 経路を Phase 1 のアダプタに切替える。

依存: Phase 1

- 2.1. `mocked-per-user-database.ts` を新アダプタに切替
  - [ ] 2.1.1. `mocked-per-user-database.ts` のクライアント生成を新アダプタ経由に置換
    - 説明: 現状の `createClient({ url: ":memory:" })` ＋ `drizzle(client, ...)` の経路を、Phase 1 で作った `createDatabaseFromTursoDatabase(':memory:')` 経路に置き換える。マイグレーション適用は 1.2.2 の `applyMigrations` を呼ぶ
    - 完了条件:
      - 型: 戻り値の型が現状の `mocked-per-user-database` の型と一致すること（呼び出し側のテストコードの型エラーがゼロ）
      - テスト: per-user-database 配下の既存統合テストが全グリーンであること
  - [ ] 2.1.2. `testing/factories/` 経路の互換確認
    - 説明: `@praha/drizzle-factory` のファクトリが新アダプタ経由でも従来と同じ振る舞いをすること（INSERT、参照取得）を検証する。テストの追加は最小限で、既存テストが緑になることが主目的
    - 完了条件:
      - テスト: 既存ファクトリ利用テストが全グリーンであること

- 2.2. `mocked-authentication-database.ts` を新アダプタに切替
  - [ ] 2.2.1. `mocked-authentication-database.ts` のクライアント生成を新アダプタ経由に置換
    - 説明: per-user-database と同じ要領で `:memory:` 経路を新アダプタに切替。authentication パッケージの drizzle スキーマを drizzle-proxy 経由で動かす
    - 完了条件:
      - 型: 戻り値の型が現状の `mocked-authentication-database` の型と一致すること
      - テスト: authentication 配下の既存統合テスト（user / account / session / verification / per_user_database テーブル系）が全グリーンであること
  - [ ] 2.2.2. authentication 用マイグレーション適用経路の整備
    - 説明: `packages/authentication/drizzle/0000_*.sql` 〜 `0001_*.sql` を新アダプタ経由で適用するパスを共通化（per-user-database の `applyMigrations` を再利用するか、authentication 側で薄くラップする）
    - 完了条件:
      - テスト: 空 DB に適用後、Better Auth が要求する全テーブルが存在すること
      - テスト: 二重適用しても副作用がないこと（冪等）

- 2.3. テストセットアップとマイグレーション適用経路の調整
  - [ ] 2.3.1. `testing/setup.ts` の旧依存（`@libsql/client`）削除
    - 説明: per-user-database / authentication のテストセットアップから `@libsql/client` の import を撤去し、新アダプタ経由のみが残るようにする
    - 完了条件:
      - 型: `@libsql/client` の import が 0 件（grep）であること
      - テスト: 該当パッケージのテストが全グリーンであること
  - [ ] 2.3.2. パッケージ間 `testing/index.ts` の export 互換維持
    - 説明: `@next-lift/per-user-database/testing` / `@next-lift/authentication/testing` の export 名と型シグネチャは変えない。利用側（他パッケージのテスト）への波及をゼロに保つ
    - 完了条件:
      - 型: 利用側テストファイルの import 行に変更が不要であること

- 2.4. CI 全テストグリーン確認
  - [ ] 2.4.1. `pnpm test` でモノレポ全体が緑であること
    - 説明: per-user-database / authentication / その他 testing/ を経由する全パッケージのテストを実行する
    - 完了条件:
      - テスト: `pnpm test` の終了コード 0、失敗 0
  - [ ] 2.4.2. `pnpm type-check` / `pnpm lint` が緑であること
    - 説明: 型エラー・lint エラーが新アダプタ移行後にゼロ件であることを保証する
    - 完了条件:
      - 型: `pnpm type-check` が exit 0
      - 確認: `pnpm lint` が exit 0

### Phase 3: Web 置換

Per-User DB / Auth DB の Web 接続を `@tursodatabase/serverless`（`/compat`）に置換する。

依存: Phase 1

- 3.1. `@tursodatabase/serverless` のインストールとアダプタ拡張
  - [ ] 3.1.1. `@tursodatabase/serverless` を関係パッケージに追加
    - 説明: `pnpm add @tursodatabase/serverless@<最新>` を `packages/per-user-database` / `packages/authentication` に追加。バージョンは `npm view @tursodatabase/serverless version` で確認
    - 完了条件:
      - 確認: 各パッケージの `package.json` に厳密バージョン指定で記載されること
      - 確認: `pnpm-lock.yaml` に追加されること
  - [ ] 3.1.2. アダプタを `@tursodatabase/serverless/compat` 入力に対応させる
    - 説明: 1.1.3 の `proxyExecute` / 1.1.4 の `proxyTransaction` を、`createClient({ url, authToken })` 互換の compat クライアントを受け取って動作するように一般化する。`@tursodatabase/database` 用と `@tursodatabase/serverless` 用で同一のアダプタが利用可能であること
    - 完了条件:
      - 型: アダプタが両ドライバーの client インスタンスを受け取れる union 型または共通インタフェースになっていること
      - テスト: serverless（compat）クライアントを `createClient({ url: ':memory:' })` 相当のテスト用 URL で接続し、INSERT/SELECT/トランザクションが成功すること（Hosted DB を叩かないテスト粒度で）

- 3.2. `create-per-user-database-client.ts` の置換
  - [ ] 3.2.1. `@libsql/client` import を `@tursodatabase/serverless/compat` に差し替え
    - 説明: `packages/per-user-database/src/features/client/create-per-user-database-client.ts` を、`@tursodatabase/serverless/compat` の `createClient({ url, authToken })` ＋ Phase 1 アダプタを通した drizzle インスタンス生成経路に書き換える。`PRAGMA foreign_keys = ON` は `exec` で適用
    - 完了条件:
      - 型: 関数シグネチャ（引数・戻り値）が現状と一致すること
      - テスト: 既存の利用側テストが全グリーンであること
  - [ ] 3.2.2. FK 有効化の動作確認テスト
    - 説明: 新クライアント経由で `PRAGMA foreign_keys = ON` が確実に効いていることを確認するテストを追加。既存になければ最低 1 ケース
    - 完了条件:
      - テスト: 親レコードの DELETE 時に CASCADE / RESTRICT が期待どおり動くこと

- 3.3. authentication パッケージの DB アクセス経路置換
  - [ ] 3.3.1. `helpers/get-database.ts` の置換
    - 説明: `@libsql/client` の `createClient` を `@tursodatabase/serverless/compat` に差し替え、Phase 1 アダプタ経由で drizzle インスタンスを返す
    - 完了条件:
      - 型: 関数シグネチャが現状と一致すること
      - テスト: authentication パッケージの統合テストが全グリーンであること
  - [ ] 3.3.2. `development/apply-auth-migration.ts` の置換
    - 説明: 開発環境マイグレーション適用ロジックを新アダプタ経由に切替。マイグレーション SQL は流用
    - 完了条件:
      - テスト: 空 DB に対する適用が成功すること（既存テスト or 新規テストで検証）
      - テスト: 冪等であること（再適用で副作用なし）

- 3.4. authentication の dev CLI（create / destroy / reset）置換
  - [ ] 3.4.1. `development/cli/create.ts` の DB 接続を新クライアントに置換
    - 説明: Turso Hosted DB に対する CLI 操作で `@libsql/client` を直接使っている経路を、`@tursodatabase/serverless/compat` 経由に変更
    - 完了条件:
      - 確認: `pnpm dev:db:create` を実行して開発者用 Hosted DB が作成・初期化できること（手動 1 回）
  - [ ] 3.4.2. `development/cli/destroy.ts` / `reset.ts` を同様に置換
    - 説明: 上記 3.4.1 と同様。`destroy` は Turso API 経由なので変更最小、`reset` は DB データ操作のため新クライアント経由に変更
    - 完了条件:
      - 確認: `pnpm dev:db:destroy` / `pnpm dev:db:reset` の両 CLI が想定どおり動くこと（手動 1 回ずつ）

- 3.5. Vercel preview / ローカル Web 動作確認
  - [ ] 3.5.1. ローカル `pnpm dev` で Web から Per-User DB / Auth DB アクセスが成功すること
    - 説明: Better Auth 認証経由でログインし、`/api/per-user-database/credentials` の取得 → Per-User DB へのスキーマ操作までが通ることを実機ブラウザで確認
    - 完了条件:
      - 確認: ログイン → クレデンシャル取得 → DB 操作（プログラム作成・取得）まで成功すること
  - [ ] 3.5.2. Vercel preview デプロイで同等の動作確認
    - 説明: PR ブランチを push し、Vercel preview の URL でも同等の経路を確認
    - 完了条件:
      - 確認: preview 環境で 3.5.1 と同じシナリオが成功すること

### Phase 4: iOS 置換

`@op-engineering/op-sqlite` + libSQL Embedded Replicas を `@tursodatabase/sync-react-native` に置換し、同期発火タイミングを「書き込み即 push + ライフサイクル pull」（論点8C）に設計変更する。

依存: Phase 1, Phase 3

- 4.1. `@tursodatabase/sync-react-native` のインストールと実機検証スパイク
  - [ ] 4.1.1. `@tursodatabase/sync-react-native` を `apps/ios` に追加
    - 説明: `pnpm add @tursodatabase/sync-react-native@<最新>` を `apps/ios` 配下で実行。バージョンは `npm view @tursodatabase/sync-react-native version` で確認。`@op-engineering/op-sqlite` はこの段階では削除しない（Phase 5 で実施）
    - 完了条件:
      - 確認: `apps/ios/package.json` に厳密バージョン指定で記載されること
      - 確認: `pnpm-lock.yaml` に追加されること
  - [ ] 4.1.2. Expo prebuild で iOS ネイティブモジュールがリンクされること確認
    - 説明: `pnpm --filter ios prebuild`（または既存の prebuild 経路）でネイティブモジュールが Pods にリンクされ、ビルドが通ることを確認。`expo-dev-client` 上でのみ動く前提
    - 完了条件:
      - 確認: prebuild が成功し、`ios/Pods/` に `@tursodatabase/sync-react-native` 関連のネイティブが含まれること
      - 確認: Expo Dev Build (実機 or シミュレータ) のビルドが成功すること
  - [ ] 4.1.3. `Database.connect` ＋ `pull()` / `push()` の最小スパイク
    - 説明: `apps/ios/src/lib/` 配下に一時的なスパイクファイルを置き、Hosted DB に対し `pull()` で初期同期 → `INSERT` → `push()` ですべて成功するかを最小コードで検証する。スパイクは Phase 4.3 着手前に削除
    - 完了条件:
      - 確認: 実機で `pull()` / `push()` がエラーなく完走すること
      - 確認: クラウド側に書き込みが反映されることを Web 側で確認（同一 DB を参照）
  - [ ] 4.1.4. drizzle 経由 raw SQL の取得制約が解消されているか確認
    - 説明: `.claude/rules/op-sqlite-raw-sql.md` で記録されていた「`db.all(sql\`...\`)` の結果が空」の問題が、新ドライバーで解消されているかを実機検証する。スパイク内で 1 ケース確認できれば十分
    - 完了条件:
      - 確認: 新ドライバー経由で `db.all(sql\`SELECT ...\`)` が期待どおり結果を返すこと

- 4.2. アダプタを sync-react-native ドライバ用に拡張
  - [ ] 4.2.1. アダプタの sync-react-native 用接続経路を実装
    - 説明: Phase 1 のアダプタを、`@tursodatabase/sync-react-native` の Database クラスから得たハンドルでも動くように拡張する。3 ドライバー（serverless / sync-react-native / database）で同一の `proxyExecute` / `proxyTransaction` インタフェースが使えること
    - 完了条件:
      - 型: 3 ドライバーいずれも受け付ける共通インタフェース型が用意されていること
      - テスト: 既存のアダプタユニットテスト（Phase 1）が新経路でも引き続き緑になること
  - [ ] 4.2.2. RN 上でのトランザクション境界の動作確認
    - 説明: sync-react-native 上で `BEGIN` / `COMMIT` / `ROLLBACK` / SAVEPOINT が想定どおり動くか、最小ユニットテスト or 実機スパイクで確認
    - 完了条件:
      - 確認: トランザクション内でエラー時に ROLLBACK され副作用が残らないこと（実機 1 ケース）

- 4.3. `apps/ios/src/lib/database.ts` の置換
  - [ ] 4.3.1. `openSync()` ＋ `libsqlSyncInterval` 経路を `Database.connect` ＋ アダプタ経由に置換
    - 説明: 旧 `@op-engineering/op-sqlite` の `openSync` ＋ libSQL Embedded Replicas 経路を完全撤去し、`@tursodatabase/sync-react-native` の `Database.connect` で得たハンドルを Phase 4.2 のアダプタ経由で drizzle に渡す
    - 完了条件:
      - 型: `database.ts` の export シグネチャ（`db`, `sync` 等）が新 API に置き換わっていること
      - 確認: `import` 行から `@op-engineering/op-sqlite` への参照がゼロになること
  - [ ] 4.3.2. マイグレーション適用経路の置換
    - 説明: 旧 `migrate(db, migrations)`（drizzle-orm/op-sqlite/migrator）から、新ドライバー上で `drizzle/migrations.js` を順次適用する経路に変更。Phase 1 の `applyMigrations` を共有するか、iOS 用に薄くラップする
    - 完了条件:
      - 確認: 起動時に空 DB 状態から全マイグレーションが適用され、テーブルが揃うこと（実機）
      - 確認: 既適用 DB に再適用しても副作用がないこと

- 4.4. `database-context.tsx` の sync インタフェース変更（`sync()` → `pull()` / `push()`）
  - [ ] 4.4.1. `useDatabase()` が返す API を `{ db, pull, push }` に変更
    - 説明: 旧 `{ db, sync }` を `{ db, pull, push }` の 2 関数に分離。型は明示し、各関数は失敗時もローカルへの書き込みを保護する設計
    - 完了条件:
      - 型: hook の戻り値型が `{ db: ..., pull: () => Promise<void>, push: () => Promise<void> }` に変わり、利用側のコンパイルエラーが解消されること
  - [ ] 4.4.2. `DatabaseProvider` の初期同期処理（初回 pull）追加
    - 説明: 初回マウント時にバックグラウンドで `pull()` を呼ぶ（失敗してもローカル読みは可能）
    - 完了条件:
      - テスト: hook 単体テスト（あれば）or 実機確認で、起動時に初回 pull が呼ばれることを確認

- 4.5. 書き込み完了時の `push()` 呼び出し追加
  - [ ] 4.5.1. `home-screen.tsx` の書き込み箇所への `push()` 連結
    - 説明: 既存の `db.insert(...)` / `db.delete(...)` の各書き込み箇所を、書き込み完了後に `push()` を即時呼ぶように変更（失敗時もローカルには残す前提）
    - 完了条件:
      - 確認: 書き込み後にクラウドへ反映されること（オンライン時、Web 側から確認）
      - 確認: 圏外でも書き込みは成功し、復帰時に再 push されること（手動 1 ケース、ネット切断 → 復帰 → 同じ画面遷移で push が走ること）
  - [ ] 4.5.2. push 失敗時のフォールバック挙動の整理
    - 説明: 専用 retry queue は実装しない方針（ADR）。ただし「次の書き込み」「フォアグラウンド復帰」のいずれかで復旧する経路があることをコード内で簡潔に説明する 1 行コメントを許容（実装から自明でなければ）
    - 完了条件:
      - 確認: コードリーディングで「失敗時は次の機会に再 push される」が読み取れる構造になっていること

- 4.6. ライフサイクルイベント（`AppState` / `useFocusEffect`）での `pull()` 呼び出し追加
  - [ ] 4.6.1. `AppState` の `'active'` 遷移で `pull()` を呼ぶフックの追加
    - 説明: `apps/ios/src/lib/` または共通の hooks ディレクトリに、`AppState` 監視で `'active'` 遷移時に `pull()` を呼ぶフックを実装。Provider 直下で 1 回だけ購読する
    - 完了条件:
      - テスト: `AppState` 状態を疑似発火させたとき `pull()` が呼ばれること（モック検証）
      - 確認: 実機で「ホーム→他アプリ→戻り」操作で `pull()` が走ること
  - [ ] 4.6.2. `useFocusEffect` で画面 focus 時に `pull()` を呼ぶ
    - 説明: 画面遷移で復帰したとき、その画面の表示前に `pull()` を呼ぶ。`home-screen.tsx` を最低 1 箇所、ほかの画面は同じパターンを横展開
    - 完了条件:
      - 確認: 実機で他画面 → ホーム画面遷移時に `pull()` が走ること
  - [ ] 4.6.3. `libsqlSyncInterval` ベースの時間トリガを完全撤去
    - 説明: 旧 `op-sqlite` ベースの設定残骸（タイマー類、設定ファイル）が残っていないか grep で確認し、削除
    - 完了条件:
      - 確認: `libsqlSyncInterval` の検索結果が 0 件であること

- 4.7. マイグレーション・PRAGMA の実機動作確認
  - [ ] 4.7.1. 実機で `PRAGMA foreign_keys = ON` が効いていること確認
    - 説明: 実機ビルドで FK 違反操作（親レコード DELETE で CASCADE / RESTRICT）が想定どおり動くか確認
    - 完了条件:
      - 確認: 実機での FK 違反テストが期待挙動になること（手動 1 ケース）
  - [ ] 4.7.2. 旧 DB ファイルを破棄し新規ファイル＋初回 pull で起動する経路の実装
    - 説明: アプリ未公開のため旧データの維持は不要（作り直し方針）。アプリ起動時に旧 `op-sqlite` 由来のローカル DB ファイル（旧パス）を検出して削除し、新ドライバー用ファイルを新規作成 → 初回 `pull()` で Hosted DB から復元する経路を実装する。旧パスの掃除は Phase 5 の旧依存撤去前にユーザーが起動した場合のフェイルセーフとして 1 度だけ走らせ、以降は noop で良い
    - 完了条件:
      - 確認: 旧 DB ファイルが残っている開発端末で起動 → 旧ファイルが削除され新ファイルでアプリが起動できること
      - 確認: 新規端末（旧ファイルなし）で起動 → 新ファイルが作成され初回 pull で Hosted のデータが復元されること
      - 確認: 全マイグレーション適用後、`programs` / `days` / 等の主要テーブルが揃っていること

- 4.8. Expo Dev Build で E2E 動作確認
  - [ ] 4.8.1. Expo Dev Build で書き込み即 push + ライフサイクル pull のシナリオを E2E 確認
    - 説明: 実機で「プログラム作成 → push 反映 → アプリ閉じ → 再開で pull → 別端末/Web 編集 → ホーム再入で反映」のシナリオを通す
    - 完了条件:
      - 確認: 上記シナリオが成功すること
  - [ ] 4.8.2. コンフリクト動作（last push wins）確認
    - 説明: 同一レコードを Web と iOS で同時編集 → 両方 push → 後勝ちの挙動になることを実機で確認
    - 完了条件:
      - 確認: 後 push 側の値が最終状態として残ること

### Phase 5: 旧依存掃除

`@libsql/client` / `@op-engineering/op-sqlite` を依存から完全削除し、関連ルール・ドキュメントを更新する。

依存: Phase 2, 3, 4

- 5.1. 旧パッケージの依存削除
  - [ ] 5.1.1. `@libsql/client` を全パッケージから削除
    - 説明: `pnpm remove @libsql/client` を `packages/per-user-database` / `packages/authentication` / `apps/web` から実行（実態として残っている箇所のみ）
    - 完了条件:
      - 確認: `pnpm-lock.yaml` から `@libsql/client` が消えていること
      - 確認: ソース全体の `import` から `@libsql/client` が 0 件であること（grep）
  - [ ] 5.1.2. `@op-engineering/op-sqlite` を `apps/ios` から削除
    - 説明: `pnpm remove @op-engineering/op-sqlite` を `apps/ios` で実行。ルート `package.json` の `op-sqlite.libsql` 設定も削除
    - 完了条件:
      - 確認: `pnpm-lock.yaml` から `@op-engineering/op-sqlite` が消えていること
      - 確認: `apps/ios` のソースから `@op-engineering/op-sqlite` の import が 0 件であること
      - 確認: ルート `package.json` の `op-sqlite` キーが削除されていること
  - [ ] 5.1.3. `drizzle-orm/op-sqlite` 関連の dead code 削除
    - 説明: `drizzle-orm/op-sqlite` の import / migrator import が残っていないか grep して削除
    - 完了条件:
      - 確認: `drizzle-orm/op-sqlite` の import が 0 件であること

- 5.2. 関連ルール・ドキュメントの掃除
  - [ ] 5.2.1. `.claude/rules/op-sqlite-raw-sql.md` の削除
    - 説明: op-sqlite 撤去に伴い不要になったルールを削除
    - 完了条件:
      - 確認: ファイルが存在しないこと
  - [ ] 5.2.2. CLAUDE.md / その他ルールから op-sqlite 言及の掃除
    - 説明: プロジェクトルートの CLAUDE.md および `.claude/rules/` 配下に op-sqlite / libSQL 旧プロトコルへの言及があれば更新または削除
    - 完了条件:
      - 確認: 残存言及が 0 件であること（grep）

- 5.3. ADR ステータス・参照の更新
  - [x] 5.3.1. ADR-007 のステータスを `Superseded by ADR-029` に変更
    - 説明: `docs/architecture-decision-record/007-op-sqlite-for-ios.md` のステータス節を更新
    - 完了条件:
      - 確認: ADR-007 のステータスが `Superseded by ADR-029` であること
  - [ ] 5.3.2. ADR-004 / ADR-010 に部分Supersede の注記追加
    - 説明: `004-turso-database.md` と `010-local-first-architecture.md` の実装方法節に「実装方法は ADR-029 で更新」の参照を追加
    - 完了条件:
      - 確認: 両 ADR にその注記が存在すること
  - [ ] 5.3.3. ADR-021 に部分Supersede の注記追加
    - 説明: `021-development-environment-turso-migration.md` のステータス or 注記節に `Partially Superseded by ADR-029 (development environment data location only)` を追加
    - 完了条件:
      - 確認: ADR-021 にその注記が存在すること
  - [ ] 5.3.4. `docs/architecture-decision-record/overview.md` の更新
    - 説明: アーキテクチャ図と技術スタック節を `@tursodatabase/*` ベースに更新
    - 完了条件:
      - 確認: 図表とテキストが新スタックを反映していること

### Phase 6: ローカル sync server への移行

開発環境のデータ実体を Turso Hosted から ローカル sync server に切り替える。preview/CI は Hosted のまま。

依存: Phase 2, Phase 3

- 6.1. `tursodb --sync-server` 起動スクリプトの整備（Auth DB / Per-User DB の 2 ポート構成）
  - [ ] 6.1.1. `tursodb` CLI の導入手順をドキュメント化
    - 説明: 開発者ローカルで `tursodb` バイナリを入れる手順（公式 install 経路、バージョン pin）を `docs/` 配下の開発者向けドキュメントに記述
    - 完了条件:
      - 確認: ドキュメントを読めば 1 から手順を踏めること（手順を実機で 1 回試して通ること）
  - [ ] 6.1.2. Auth DB 用 sync server 起動スクリプト追加（port 8080）
    - 説明: ルート `package.json` に `dev:sync-server:auth` を追加し、`tursodb ./.local/auth.db --sync-server 0.0.0.0:8080` 相当を実行する。ポート・ファイルパスは環境変数で上書き可能にする
    - 完了条件:
      - 確認: `pnpm dev:sync-server:auth` で sync server が port 8080 で起動すること
      - 確認: `.local/` がリポジトリの `.gitignore` に入っていること（DB ファイル流出防止）
  - [ ] 6.1.3. Per-User DB 用 sync server 起動スクリプト追加（port 8081）
    - 説明: ルート `package.json` に `dev:sync-server:per-user` を追加し、`tursodb ./.local/per-user.db --sync-server 0.0.0.0:8081` 相当を実行する
    - 完了条件:
      - 確認: `pnpm dev:sync-server:per-user` で sync server が port 8081 で起動すること
  - [ ] 6.1.4. 統合起動スクリプト `dev:sync-server` の追加
    - 説明: `concurrently` 等を使って 6.1.2 / 6.1.3 を並行起動する `dev:sync-server` をルート `package.json` に追加。`pnpm add -D concurrently@<最新>` をルートで実行（既に依存していなければ）
    - 完了条件:
      - 確認: `pnpm dev:sync-server` 一発で 2 つの sync server が起動し、双方への接続が成功すること
      - 確認: いずれかが落ちたら他方も停止する（または落ちた側が再起動できる）挙動になっていること
  - [ ] 6.1.5. Per-User DB 動的作成の開発時分岐実装
    - 説明: `packages/authentication/src/features/instance/`（Better Auth サインインフック）と関連箇所で、開発環境（NODE_ENV または専用フラグ）の場合は Turso Platform API での動的 DB 作成 + JWT 発行をスキップし、固定 URL `http://localhost:8081` を `per_user_database` テーブルに登録する分岐を追加。本番経路（`createTursoPerUserDatabase` / `issue-token`）は変更しない
    - 完了条件:
      - テスト: 開発環境フラグ ON で、`createTursoPerUserDatabase` が呼ばれず固定 URL がクレデンシャルとして返ること（mock/spy で検証）
      - テスト: 本番フラグ ON で従来どおり動的作成経路が呼ばれること
      - 確認: ローカル開発で初回サインイン → `per_user_database` テーブルに `http://localhost:8081` が保存されることを実機で確認
  - [ ] 6.1.6. ローカル sync server 認証なし接続のクライアント側対応
    - 説明: `@tursodatabase/serverless/compat` および `@tursodatabase/sync-react-native` で、`authToken` が空または未指定でもローカル sync server に接続できるかを検証し、必要なら開発時用に `authToken` を空文字で渡すヘルパーを `packages/per-user-database` / `packages/authentication` に追加
    - 完了条件:
      - 確認: ローカル開発で Web / iOS の両方が `authToken` 無し（または空）でローカル sync server に接続できること
      - テスト: クライアント生成ヘルパーが「環境変数の `authToken` が空なら省略する」分岐になっていること

- 6.2. seed / reset スクリプトの整備（Auth DB / Per-User DB の両方を対象）
  - [ ] 6.2.1. Auth DB / Per-User DB 共通の seed スクリプトの追加
    - 説明: `tsx scripts/seed.ts`（既存スクリプト体系に合わせた配置）で両 DB に初期データを投入する。Per-User DB は `@praha/drizzle-factory` のファクトリを再利用。Auth DB は最低限の開発用ユーザー / セッション / `per_user_database` レコード（固定 URL `http://localhost:8081`）を投入する
    - 完了条件:
      - 確認: `pnpm dev:db:seed` 後、ローカル Web からログイン状態のままデータが参照できること
      - 確認: `per_user_database` テーブルに `http://localhost:8081` が登録されていること
  - [ ] 6.2.2. reset スクリプトの追加
    - 説明: 両 DB ファイル（`./local/auth.db` / `./local/per-user.db`）を削除 → 各 DB のマイグレーション再適用 → seed の流れを 1 コマンドにまとめる。sync server プロセスが起動中なら停止指示を促すか、ファイル削除前にロックを処理
    - 完了条件:
      - 確認: `pnpm dev:db:reset` で両 DB が初期状態に戻ること
      - 確認: reset 後に `pnpm dev:sync-server` を再起動すれば動作再開できること

- 6.3. 環境変数とドキュメントの切替
  - [ ] 6.3.1. `.env.example` に 2 つの URL の切替ガイド追加
    - 説明: `apps/web/.env.example` および `apps/ios` の env サンプルに以下を追記。
      - 開発: `TURSO_AUTH_DATABASE_URL=http://localhost:8080` / `PER_USER_DATABASE_URL=http://localhost:8081`（開発時固定）/ `authToken` は空
      - preview/CI: 既存の Hosted URL + Turso 認証トークン
    - 完了条件:
      - 確認: 新規開発者が `.env.example` を見て自分の `.env` を作れる粒度であること
      - 確認: 開発と preview/CI の両セクションが明示的に区別されていること
  - [ ] 6.3.2. 開発時 Per-User DB URL の参照経路整備
    - 説明: 開発環境では Per-User DB の URL が「ログイン時に動的に Auth DB に登録された値」ではなく「固定値」であることを利用するため、`packages/authentication/src/features/user-database-credentials/` の `getCredentials` がそのまま固定 URL を返せることを確認。必要なら 6.1.5 の seed が登録した値を読み出す経路だけで完結させる
    - 完了条件:
      - テスト: 開発フラグ ON で `getCredentials` が `http://localhost:8081` を返すこと
      - テスト: 本番フラグ ON で従来どおり Hosted URL を返すこと
  - [ ] 6.3.3. 開発者向けドキュメントの整備
    - 説明: README / `docs/` の開発手順節に、`pnpm dev:sync-server` 起動 → `pnpm dev:db:seed` → `pnpm dev` の標準フローを追記。ADR-021 で書かれていた Hosted 開発手順は preview/CI 用に位置付け直す
    - 完了条件:
      - 確認: ドキュメントどおりに手順を踏めば動くこと（同僚 1 人にレビュー依頼できる粒度）
      - 確認: ポート割当（8080=Auth, 8081=Per-User）が明記されていること

- 6.4. ADR-021 の管理スクリプト名読み替えと注記
  - [ ] 6.4.1. ADR-021 に Phase 6 完了に伴う読み替え注記を追加
    - 説明: ADR-021 で導入された `pnpm dev:db:create` などの命名規則を、ローカル sync server 移行後にどう読み替えるか（あるいは Hosted 用として残すか）を ADR-021 に追記。Phase 5.3.3 の注記とは別に、運用観点の注釈
    - 完了条件:
      - 確認: ADR-021 に「Hosted 用 CLI として残す」or 「sync-server 系に役割を限定する」が明記されていること
  - [ ] 6.4.2. 旧 dev:db 系スクリプトの再定義 or 残置判断
    - 説明: `packages/authentication/package.json` の `dev:db:create` / `destroy` / `reset` を Hosted 専用 CLI として残すか、ローカル sync server 用に役割を変更するかを判断し、`package.json` を更新
    - 完了条件:
      - 確認: スクリプト名から用途が読み取れること（あるいは README に対応関係を明記）

- 6.5. ローカル E2E 動作確認と preview/CI 影響確認
  - [ ] 6.5.1. Web → 2 ポート sync server 経由でログイン + DB 操作の E2E
    - 説明: `pnpm dev:sync-server` で 8080 / 8081 を起動 → `pnpm dev:db:seed` → `pnpm dev` で Web 起動 → ログイン（Auth DB: 8080）→ プログラム作成（Per-User DB: 8081）→ 一覧表示までを通す
    - 完了条件:
      - 確認: 上記フローが成功すること
      - 確認: 8080 / 8081 のいずれかを停止すると該当機能のみ落ちることを最低 1 ケース確認（経路分離の検証）
  - [ ] 6.5.2. iOS → Per-User DB sync server (8081) 経由で push/pull の E2E
    - 説明: Expo Dev Build を `http://<開発機 IP>:8081` を指すようビルドし、書き込み即 push + ライフサイクル pull が通ることを実機確認
    - 完了条件:
      - 確認: 上記フローが成功すること
  - [ ] 6.5.3. preview / CI が Hosted のまま動くこと確認
    - 説明: Phase 6 のローカル切替が preview / CI に影響しないことを Vercel preview デプロイで確認
    - 完了条件:
      - 確認: preview 環境で従来同様にログイン・DB 操作ができること
      - 確認: 開発時分岐（6.1.5）が preview / CI で発動していないこと（動的作成経路が呼ばれていることをログ等で確認）

## 議論ログ

### ラウンド0: スコープ確認（自動判断）

- 判断: ADR-029 はすでに論点1〜8の決定内容と段階移行プラン（Phase 1〜6）が確定しているため、フェーズ1（要件確認）・フェーズ2（設計判断）はADR本文を正としてスキップし、第1階層をPhase 1〜6に置く
- 判断: 開発環境変更（Phase 6）は preview/CI に影響しないため Phase 2-3 完了後に並行着手可能。本ツリーでは依存関係のみ記述し、PR 順序は実装時に判断

### ラウンド1: Phase 4.7.2（旧ローカル DB ファイルの扱い）

- Q: 旧 `op-sqlite` 由来の DB ファイルを新ドライバーで開けるか確認するか、それとも作り直し前提か
- A: アプリ未公開のため作り直しでよい
- 判断: 4.7.2 を「旧ファイル削除 → 新規ファイル作成 → 初回 pull で復元」経路の実装タスクに具体化

### ラウンド2: Phase 6.1.3（Per-User DB と Auth DB の sync server 構成）

- Q: ローカル sync server で Auth DB / Per-User DB をどう扱うか（A: 2 ポート分離 / B: 単一 DB に統合 / C: Per-User だけファイル直接 / D: 全部ファイル直接）
- A: A（2 ポート分離）
- 判断:
  - 案 A 採用。port 8080=Auth DB、port 8081=Per-User DB（開発時 1 ユーザー固定）
  - 6.1 を 6 サブタスクに再分解（CLI 導入 / Auth 起動 / Per-User 起動 / 統合起動 / 動的作成の開発時分岐 / 認証なし接続のクライアント対応）
  - 6.2 / 6.3 を 2 ポート構成 + Auth DB seed 込みに整合
  - 6.5 の E2E シナリオを 2 ポート分離前提に書き直し
  - 開発時分岐は `packages/authentication/src/features/instance/` で行い、本番経路（`createTursoPerUserDatabase` / `issue-token`）は変更しない
