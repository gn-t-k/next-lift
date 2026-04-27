# ADR-026: Per-User Databaseの外部キー制約方針

## ステータス

Accepted

## コンテキスト

Per-User Database のERD（`docs/project/erd-design/schema.md`、15テーブル）をDrizzleスキーマとして実装するにあたり、テーブル間リレーションにどのように外部キー制約（FK）を張るかを決定する必要がある。

ERDの設計判断（`docs/project/erd-design/design-decisions.md`）では以下が確定している:

- 全テーブル物理DELETEを採用（設計判断#15）
- プログラム削除時等のカスケード削除は「アプリ側で順序制御（子→親の順に削除）」と記述（`use-case-queries.md` UC_A_7, UC_A_11, UC_B_6）

ただし、**DB側のFK制約の有無とON DELETE挙動自体は明示されていない**。

### 本件の特性

- **Per-User DB**: 各ユーザーが独立した1つのDBを持つ。DBをまたぐ参照は発生しない
- **マルチプラットフォーム**: 同一スキーマを Web（Turso）と iOS（op-sqlite）の両方で使用する
- **全物理DELETE**: 論理削除なし。親DELETEで子も消える必要がある
- **個人アプリ**: データ規模は1ユーザー数万行オーダー
- **Authentication DB とは独立した判断**: ADR-020 では `per_user_database.userId` に FK を設けない決定をしているが、あれは「アカウント削除時にPer-User DBを保持する」という業務要件から来る判断。本件（Per-User DB 内部のドメインテーブル間）とは関心事が異なる

### FK制約を巡る一般的な論点

設計判断を行うにあたり、以下を整理する:

- FK制約を付けない選択肢は「野良データ（参照先が存在しない子レコード）の一時的存在を業務上許容できるサービス」で意味を持つ。具体的にはマイクロサービス境界を越えた参照や、水平分割で同一トランザクションを保証できないケースで採られる
- FK制約を付ける選択肢は「野良データが一切許容されないほどの強い整合性が必須のサービス」で価値が出る。UPDATE時の存在しないIDへの紐付けミスや、管理系DELETEでの整合性破壊といった、アプリのテストで全て捕捉しきれない種類のバグをDB制約で水際で止められる
- ON DELETE は CASCADE / NO ACTION（=RESTRICT相当） / SET NULL から選択。アプリ側に削除順序の責務を残すか、DBに自動連鎖を任せるか、参照を切り離して残すか、というトレードオフ

### 論点

FKの扱いについて、大きく3案が存在する:

| 案 | 概要 | 評価 |
| --- | --- | --- |
| **全FK張り + NO ACTION** | 全リレーションに `references()` を設定、ON DELETEは既定 | UPDATE時の誤参照・孤立データをDB制約で防げる。親DELETE時はアプリ側が子→親順にDELETEする必要あり |
| **全FK張り + CASCADE** | 親DELETEでDBが子を自動削除 | アプリ側のDELETE順序実装が不要。意図しない連鎖削除（種目削除→ワークアウト記録消滅等）が発生しやすい |
| **FK無し** | 参照整合性はアプリ全責任 | 親だけ先に消して孤立レコードを後から掃除するようなパフォーマンス最適化が可能。反面、iOS/Web双方のUPDATEバグで誤参照レコードが生まれても検知が遅れる |

本件のリレーションは、いずれも孤立状態では意味を持たない種類（`days.program_id`, `exercise_plans.day_id`, `set_plans.exercise_plan_id`, `exercise_logs.workout_id`, `set_logs.exercise_log_id`, `workout_day_links.*`, `workout_completions.workout_id`, `exercise_plan_exercises.*`, `one_rep_maxes.exercise_id` 等）。ただし「孤立＝即バグ」と断じるのは強すぎる: FK無しで親だけを先に削除し、孤立レコードを後からバッチで掃除するという設計は、大量DELETE時のパフォーマンスを優先するなら合理的な選択肢となり得る。本件は個人アプリでDELETE頻度も規模も小さく、この最適化の価値は相対的に低い。

## 決定内容

**Per-User Database の全FKリレーションに `references(() => parent.id)` で外部キー制約を張る。ON DELETEは明示指定せず `NO ACTION`（SQLite の既定）とする。**

### 適用ルール

1. **FK対象カラム**: ERDで FK として描かれている全カラム（`days.program_id`, `exercise_plans.day_id`, `exercise_plan_exercises.exercise_plan_id`, `exercise_plan_exercises.exercise_id`, `set_plans.exercise_plan_id`, `weight_reps_params.set_plan_id`, `weight_rpe_params.set_plan_id`, `reps_rpe_params.set_plan_id`, `exercise_logs.workout_id`, `exercise_logs.exercise_id`, `set_logs.exercise_log_id`, `one_rep_maxes.exercise_id`, `workout_day_links.workout_id`, `workout_day_links.day_id`, `workout_completions.workout_id`）
2. **ON DELETE**: 明示しない（SQLite既定の `NO ACTION`）。親DELETE時に子が残っているとFK違反でエラーになるため、アプリ側が子→親の順で削除する
3. **ON UPDATE**: 明示しない（既定）。IDはランダム生成で不変のため考慮不要
4. **FKカラムのインデックス**: SQLiteはFKに自動インデックスを貼らないため、子テーブル側から `WHERE parent_id = ?` や JOIN で頻繁に使うFKカラムには明示的に `index(...)` を付与する（PK・UK兼用カラムは自動インデックスで代替）
5. **`PRAGMA foreign_keys = ON`**: 接続時に明示的に有効化する。libSQLは `SQLITE_DEFAULT_FOREIGN_KEYS=1` でビルドされておりデフォルトONだが、これは未文書化の実装詳細であり、また op-sqlite (libsql バックエンド) のデフォルト挙動も公式に保証されていないため、両環境で明示PRAGMAを発行する。`packages/per-user-database/src/features/client/create-per-user-database-client.ts`（Web）と `apps/ios/src/lib/database.ts`（iOS）の両方で実施する

### 採用理由

1. **UPDATE時の誤参照を防ぐ**: 存在しないIDへの紐付けはアプリ側のテストで全て捕捉しきるのが難しい。DB制約で最後の防衛線を張る価値が高い
2. **マルチプラットフォーム耐性**: iOS（op-sqlite）と Web（Turso）で同じスキーマを使う。どちらか片方のアプリコードにバグが混入しても、DB制約が参照整合性を守る
3. **DELETE頻度・規模が小さい**: パーソナルアプリでありDELETEは稀（プログラム削除・種目削除・ワークアウト削除・1RMクリア程度）。FK無しによる「親だけ削除＋孤立レコード掃除」のパフォーマンス優位が実用上得にくい
4. **ERD設計判断との整合**: 「アプリ側で子→親の順に削除」は `NO ACTION` を前提とした書き方として自然に読める
5. **DB分割予定なし**: FKが嫌われる主要因（マイクロサービス化・水平分割によるトランザクション境界の制約）が本件には存在せず、将来のボトルネックになる懸念が低い

### CASCADEを選ばなかった理由

- ERD設計判断「アプリ側で順序制御」が `NO ACTION` 前提の記述に読める
- CASCADEは便利だが、意図しない連鎖削除（例: exercises 削除で exercise_logs が消える）を許容すると、ユーザーが「種目名の編集」と「種目の削除」を取り違えた時に記録データが失われる
- 削除範囲の判断をアプリ側（ユースケース実装）に残すことで、UIでの確認ダイアログや削除前チェックを組み込みやすい

## 結果・影響

### メリット

- 野良データ発生がDBレベルで防がれる
- iOS/Web いずれかの実装バグがもう一方のデータを汚染するリスクを低減
- 不正なUPDATE（存在しないIDへの差し替え）もDBが弾く
- `PRAGMA foreign_keys = ON` の明示発行により、libSQL/op-sqlite のデフォルト挙動に依存せず整合性保証が得られる

### デメリット・注意事項

- **削除順序の遵守が必要**: アプリ側で子→親の順にDELETEしないとFK違反で失敗する。UC_A_7, UC_A_11, UC_B_6, UC_D_3 の実装時に明示的に順序制御する（既にERD設計判断でその前提）
- **大量DELETEのパフォーマンス**: 子→親順の逐次DELETEは件数が多いと時間がかかり得る。本件はDELETE頻度・規模とも小さいため実害は想定されないが、将来問題になれば CASCADE への切り替えや一時的な `PRAGMA defer_foreign_keys = ON` 等の対処が必要になる可能性がある
- **間違った種目削除等のユーザー操作ミス**: CASCADEと違って自動連鎖削除は起きないが、アプリが明示的に子を削除する実装になっているため、アプリのUIが連鎖削除を行えばやはり記録データは消える。復旧シナリオとしては Turso 側（primary）のリモートDBに対して操作できるため、そこからのデータ回復余地がある（要確認事項）
- **`PRAGMA foreign_keys = ON` の設定漏れリスク**: SQLiteはコネクションごとに enforcement フラグを持つ。接続時のイニシャライズを必ず実施する必要がある
- **libSQLのデフォルト挙動**: 実証検証により、libSQL (`@libsql/client`) はビルド時に `SQLITE_DEFAULT_FOREIGN_KEYS=1` フラグが設定されており、`PRAGMA compile_options` の出力にも `DEFAULT_FOREIGN_KEYS` が含まれることを確認済み。ただし公式ドキュメントには記載がなく、未文書化の実装詳細である。将来変更されるリスクを踏まえ、本リポジトリでは明示的に `PRAGMA foreign_keys = ON` を発行する方針とする
- **op-sqlite (libsqlバックエンド) の挙動**: op-sqliteはコンパイル時に libsql バックエンドを有効化することで本物のlibSQLをリンクする（`package.json` の `op-sqlite.libsql: true`）。デフォルトFK挙動は公式に保証されていないため、iOS側でも明示的にPRAGMAを発行する
- **op-sqlite 実機検証結果（2026-04-27）**: iOSシミュレータ上で `PRAGMA compile_options`（54件）に `DEFAULT_FOREIGN_KEYS` が含まれることを確認。明示PRAGMA発行前後とも `foreign_keys = 1`。Web側（libSQL）と同じく `SQLITE_DEFAULT_FOREIGN_KEYS=1` でビルドされている前提が現時点では成立しているが、未文書化の実装詳細である点は変わらないため、明示PRAGMA発行を維持する

### 波及範囲

- `packages/per-user-database/src/database-schemas/*` の全テーブル定義に `references()` を追加
- `packages/per-user-database/src/features/client/create-per-user-database-client.ts` で接続直後に `PRAGMA foreign_keys = ON` を実行（実装済み）
- `apps/ios/src/lib/database.ts` の `initializeDatabase` で同様に明示PRAGMAを実行（実装済み）
- FK enforcement が効いていることはテストで再検証しない（libSQL/SQLite の機能テストになるため）。本ADRと明示PRAGMAコードでの担保にとどめる
- 削除系ユースケース実装時は子→親の順序を守る

## 代替案

### 1. 全FK張り + ON DELETE CASCADE

親DELETEでDB側が子を自動削除する方式。

**却下理由**: ERD設計判断の「アプリ側で順序制御」という記述と齟齬。意図しない連鎖削除の防止（ユーザー操作ミスへの耐性）を考えると、アプリ側で明示的に削除する方がドメインロジックを通過するため安全。

### 2. FK無し（参照整合性はアプリ任せ）

親DELETE時に子を残して後からバッチで掃除するなどパフォーマンス最適化の自由度がある。マイクロサービス間参照や水平分割でトランザクション境界を超える場合に採用される方式。

**却下理由**: 本件はマイクロサービス化・DB分割予定がなく、DELETE頻度・規模が小さいためFK無しの最適化余地を享受する場面が少ない。一方でマルチプラットフォームで同スキーマを使う特性から、UPDATE時の誤参照をDB制約で検知できる価値は大きい。

### 3. 選択的FK（ホットパスのみFK、マスタ参照はFK無し等）

一部リレーションだけにFKを張る折衷案。

**却下理由**: 本件の全リレーションは「孤立状態に意味を持たない」同質な関係で、選別の合理的境界線がない。認知負荷だけが増す。

## 決定日

2026-04-24
