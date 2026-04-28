# ADR-028: Per-User Database の物理設計制約方針

## ステータス

Accepted

## コンテキスト

Per-User Database のスキーマ（`packages/per-user-database/src/database-schemas/*`、15テーブル）は、ADR-005 / ADR-020 / ADR-026 / ADR-027 で構造面の方針が確定し、現状は以下の物理制約のみが入っている。

- 主キー / 外部キー（ADR-026）
- `NOT NULL`
- 一部の `DEFAULT`（例: `exercises.default_weight_input_unit DEFAULT 'kg'`）

一方で、以下のクラスの制約は未整備で、すべてアプリケーション層に委ねられている。

- テキストカラムの長さ上限・空文字禁止
- 数値カラムの値域（負値・極端値の防止）
- 行内タイムスタンプの順序整合（`achieved_at <= registered_at` 等）

Turso（libSQL）も op-sqlite も SQLite 互換であり、`VARCHAR(n)` は型として定義しても長さを強制しない。長さ・値域を実際に強制したい場合は CHECK 制約を貼る必要がある。

### 関連する既存方針

- **ADR-027**: 区分値カラム（`plan_type`, `weight_type`, `weight_input_unit`, `default_weight_input_unit`）はDB enum / CHECK を使わずアプリ側定数で管理
- **ADR-026**: 全FKリレーションに `references()` で参照整合を強制
- **ERD設計判断 #19**: nullable 排除方針
- **ERD設計判断 #20**: `exercise_logs.memo` / `set_logs.rpe` / `set_logs.memo` は「入力しなかった」を NULL で表現

### 解きたい問題

物理的にあり得ない値（負の重量、0以下のRPE、未来の達成日時など）や、DoS級の巨大テキストが、アプリ側のバグ・経路漏れで Per-User DB に書き込まれた場合、現状はDB側で検知できない。Per-User DB は本人のDBに閉じているため他ユーザーへの被害はないが、

- マルチプラットフォーム（Web / iOS）で同一スキーマを共有しているため、片方のアプリ実装バグで不正値が入りうる
- ストレージ・インデックスサイズの予測可能性が下がる
- バグ起点の不正値は早期に検知したい

という事情があり、DB境界での最終防衛線として CHECK 制約を導入する価値がある。

## 論点

### 論点1: 物理制約をどこで強制するか

| 案 | 概要 | Pros | Cons |
| --- | --- | --- | --- |
| **1A: アプリ層 Zod を一次防御 + DB CHECK を最終防衛線（二段構え）** | UI に近い細かい制約は Zod、物理的妥当性のみ DB CHECK | 経路漏れ・実装バグでも DB 境界で異常値を止められる。マルチプラットフォーム間で整合性が保たれる。CHECK は緩めの保険上限なので業務上限変更でマイグレーション不要 | スキーマ定義が増える。Zod と CHECK の二重管理が発生する箇所がある |
| 1B: アプリ層のみ | Zod / バリデーションだけで担保 | スキーマがシンプル | バックエンドにバグや経路漏れがあると無制限のデータが入りうる。Web / iOS の片方の実装漏れを検知できない |
| 1C: DB CHECK のみ | アプリ層では値域チェックしない | 二重管理がない | UX レベルの細かい制約（名前1〜50文字など）を DB に書くと業務上限変更のたびにマイグレーションが必要。CHECK のエラーメッセージはユーザー向けに使えない |

### 論点2: 区分値カラムに CHECK を入れるか

| 案 | 概要 | 評価 |
| --- | --- | --- |
| **2A: 入れない（ADR-027 を維持）** | 区分値はアプリ側定数で管理 | ADR-027 で確定済み。区分値の取りうる集合をDB/コード両方で持つと二重管理になり、TypeScript の Union 型と DB CHECK の同期が壊れやすい |
| 2B: 入れる | `weight_type IN ('kg', 'percent_1rm')` 等を CHECK | ADR-027 を覆すことになる。値追加のたびにマイグレーションが必要 |

### 論点3: テキスト長制約をどう貼るか

| 案 | 概要 | Pros | Cons |
| --- | --- | --- | --- |
| **3A: 名前系とメモ系で上限を分ける + 名前系は空文字禁止 + メモ系は NULL or `length > 0`** | 名前 200 / メモ 10000、空文字を弾く | NULL（未入力）と空文字（バグ）の混在を防ぎ、データ品質が安定する | 空入力時にアプリ側で NULL に正規化する責務が発生 |
| 3B: 上限のみ、空文字許容 | `length <= N` のみ | 実装が単純 | 「未入力」が NULL と空文字で表現揺れする |
| 3C: 制約なし | 現状維持 | 変更不要 | 異常値検知ができない |

### 論点4: 計画と実績で `reps` の下限を分けるか

| 案 | 概要 | 評価 |
| --- | --- | --- |
| **4A: 計画 `> 0` / 実績 `>= 0`** | 計画は最低1レップ、実績は失敗セット（0レップ）を許容 | 物理的妥当性とドメイン上の意味の両方に整合 |
| 4B: 統一して `>= 0` | 計画でも 0 を許容 | 計画 reps=0 はバグだが DB では検知できない |
| 4C: 統一して `> 0` | 実績でも 0 を禁止 | 失敗セット記録ができなくなる |

### 論点5: テーブルをまたぐ整合（`started_at <= completed_at` 等）

| 案 | 概要 | 評価 |
| --- | --- | --- |
| **5A: アプリ側担保** | DB 制約に入れない | SQLite の CHECK は同一行のカラムしか参照できないため、行内整合（`one_rep_maxes.achieved_at <= registered_at`）はDBで強制可能だが、`workouts.started_at <= workout_completions.completed_at` のような別テーブル間整合はトリガーかアプリ側でしか担保できない。トリガーはマルチプラットフォーム保守コストが高い |
| 5B: トリガーで担保 | INSERT / UPDATE トリガーで検証 | SQLite トリガーは Drizzle スキーマでの表現が弱い。Web / iOS 双方で挙動を揃える保守コストが高い |

## 決定内容

**論点1=1A、論点2=2A、論点3=3A、論点4=4A、論点5=5A を採用する。**

すなわち、Per-User DB のテーブルに以下のカテゴリの CHECK 制約を導入する。

### A. テキスト長

| カラム | CHECK |
| --- | --- |
| `programs.name` / `days.label` / `exercises.name` | `length(x) BETWEEN 1 AND 200` |
| `programs.meta_info` / `days.meta_info` / `exercise_plans.meta_info` / `set_plans.meta_info` / `exercise_logs.memo` / `set_logs.memo` | `x IS NULL OR length(x) BETWEEN 1 AND 10000` |

- 名前系の上限 **200**: UI 想定（数十文字）の数倍。DoS / バグ起因の暴走入力の保険
- メモ系の上限 **10000**: 自由記述として現実的な最大量（原稿用紙25枚相当）。これを超えるのはバグ
- 空文字を弾くことで、NULL（=未入力）と空文字（=バグ）の表現揺れを防ぐ。アプリ側は空入力時に NULL を書き込む責務を負う
- SQLite の `length()` は文字数（UTF-8コードポイント）であり、日本語1文字=1としてカウントされる

### B. 数値値域

| カラム | CHECK | 補足 |
| --- | --- | --- |
| `days.display_order` / `exercise_plans.display_order` / `set_plans.display_order` / `exercise_logs.display_order` / `set_logs.display_order` | `>= 0` | 表示順は非負整数 |
| `weight_reps_params.weight_value` / `weight_rpe_params.weight_value` | `>= 0` | 自重種目の 0kg 計画を許容 |
| `set_logs.weight_kg` | `>= 0` | 同上（自重 0kg を許容） |
| `one_rep_maxes.weight_kg` | `> 0` | 1RM が 0kg は物理的にあり得ない |
| `weight_reps_params.reps` / `reps_rpe_params.reps` | `> 0` | 計画は最低1レップ |
| `set_logs.reps` | `>= 0` | 失敗セット（0レップ実績）を許容 |
| `weight_rpe_params.rpe` / `reps_rpe_params.rpe` | `BETWEEN 1 AND 10` | RPE スケール |
| `set_logs.rpe` | `IS NULL OR BETWEEN 1 AND 10` | NULL（未入力）許容 |

### C. 行内タイムスタンプ整合

| テーブル | CHECK |
| --- | --- |
| `one_rep_maxes` | `achieved_at <= registered_at` |

達成日時（ユーザー入力）と登録日時（システム自動設定）の論理的順序を強制する。「未来の達成日時を登録」というバグや誤操作を防ぐ。

### D. CHECK を入れない（アプリ側担保）

以下は CHECK で表現すべきでない、または表現できないため、アプリケーション層で担保する。

- **区分値カラム**（`set_plans.plan_type`, `weight_reps_params.weight_type`, `weight_rpe_params.weight_type`, `set_logs.weight_input_unit`, `one_rep_maxes.weight_input_unit`, `exercises.default_weight_input_unit`）: ADR-027 の方針通り、アプリ側定数で管理
- **テーブルをまたぐ整合**: `workouts.started_at <= workout_completions.completed_at` など、行内 CHECK で表現できない制約はアプリ側で担保
- **タイムスタンプの未来日付禁止**: SQLite の CHECK は純粋関数のみで `now()` を扱えない（評価タイミングの問題）。アプリ側で担保
- **業務上の細かい上限**（名前 1〜50 文字、メモ 1〜500 文字など UI 起因の上限）: Zod 等のアプリ層バリデーションで担保。DB CHECK は緩めの保険上限のみ
- **`weight_type=percent_1rm` のときの `weight_value` 範囲**: `weight_type` に依存する複合条件は CHECK が複雑化するためアプリ側で担保

## 採用理由

1. **二段構えがマルチプラットフォーム特性に適う**: Web / iOS の双方が同一スキーマを使うため、片方の実装バグで生じる異常値を DB 境界で止められる価値が大きい（ADR-026 でFK制約を入れた理由と同じ）
2. **物理的妥当性と区分値の関心事を分離**: ADR-027 が禁じているのは「取りうる値の集合の二重管理」であり、長さ・値域・順序などの物理的妥当性は別カテゴリとして扱える。両ADRは矛盾しない
3. **保険上限という位置付け**: CHECK は UX レベルの細かい上限ではなく「ここを超えたらバグ」というラインに置く。業務上限の変更でマイグレーションが発生しないため運用コストが低い
4. **NULL / 空文字の表現揺れを防ぐ**: メモ系を `length > 0 OR NULL` にすることで、未入力は必ず NULL になり、フィルタクエリ（`WHERE memo IS NOT NULL`）が安定する（ERD設計判断 #20 と整合）
5. **SQLite / libSQL / op-sqlite で同じ挙動**: CHECK は SQLite 標準機能でデフォルト ON。FK のような明示PRAGMAは不要

## 代替案で却下した理由

### 1B: アプリ層のみ

UPDATE時の誤参照を DB 制約で防ぐ ADR-026 の判断と整合しない。マルチプラットフォーム保守における「片方のアプリの実装漏れを検知できない」リスクを残す。

### 1C: DB CHECK のみ

UX レベルの細かい上限を DB に書くと業務要件変更のたびにマイグレーションが必要。CHECK 違反のエラーメッセージはユーザー向けに加工しづらく、Zod のフィールド単位エラーと同等の体験を提供できない。

### 2B: 区分値に CHECK

ADR-027 を覆す。TypeScript の Union 型と DB CHECK の同期保守は壊れやすく、値追加のたびにマイグレーションが発生する。

### 4B / 4C: reps の下限を統一

計画（指定値）と実績（事実値）はドメイン上の意味が異なる。統一は片方の表現力を損なう。

### 5B: トリガーで別テーブル整合を担保

SQLite トリガーは Drizzle スキーマでの表現力が弱く、Web（Turso）と iOS（op-sqlite）双方で挙動を揃える保守コストが高い。アプリ側のユースケース実装で順序保証する方が現実的。

## 結果・影響

### メリット

- バグ起因の不正値（負の重量、0以下のRPE、未来の達成日時、空文字、巨大テキスト）が DB 境界で止まる
- マルチプラットフォーム間の整合性が DB レベルで保証される
- ストレージ・インデックスサイズの上限が予測可能になる
- メモ系の NULL / 空文字混在が解消する

### デメリット・注意事項

- スキーマ定義が CHECK 分だけ増える
- Zod スキーマと DB CHECK の二段構えになる箇所があり、緩めの保険値（200 / 10000 など）と業務上限値（50 / 500 など）の対応関係をコードレビューで意識する必要がある
- 既存テーブルへの CHECK 追加は SQLite では `ALTER TABLE ADD CONSTRAINT` が使えず、Drizzle のマイグレーションでテーブル再構築（CREATE → INSERT SELECT → DROP → RENAME）が走る。dev / local の既存データはリセットが必要
- アプリ側は空入力時に NULL を書き込む責務を負う（メモ系）。空文字書き込みは CHECK 違反になる
- 将来 RPE スケールが 0.5 刻みなどに拡張された場合、`BETWEEN 1 AND 10` のままでよい（小数許容）。ハーフポイント単位の制約は CHECK で表現せずアプリ側で担保
- マイグレーションは ADR-027 と同様に `dialect: "sqlite" + driver: "expo"` で SQL と `migrations.js` の両方を生成する

### テストでの取り扱い

CHECK 制約が enforce されていることはテストで再検証しない（ADR-026 の FK 制約と同じ位置付け。libSQL / SQLite の機能テストになるため、本ADRと Drizzle スキーマでの担保にとどめる）。

ただし以下は実装PR時に確認する:

- 既存統合テスト（`packages/per-user-database/`、`packages/authentication/` 等）が `pnpm test` で全て通ること（CHECK 違反でファクトリやセットアップが破綻していないこと）
- `testing/factories/*` のデフォルト値が CHECK を満たすこと（必要に応じて既定値を調整）

境界値（`reps > 0` vs `>= 0`、`rpe BETWEEN 1 AND 10` 等）の妥当性は、CHECK 式そのものを assert で書き直すテストではなく、本ADR の「決定内容」セクションと PR レビューで担保する。

### 波及範囲

- `packages/per-user-database/src/database-schemas/` 全テーブル定義に Drizzle の `check()` ヘルパーで CHECK 制約を追加
- `packages/per-user-database/drizzle/` に新規マイグレーションファイル
- `packages/per-user-database/src/testing/factories/` のファクトリは既存値が CHECK を満たしているか確認（既定値を見直す可能性あり）
- アプリ層（`apps/web` / `apps/ios`）の Zod スキーマと CHECK の対応関係をコードレビューで確認
- アプリ層の書き込みパスで「メモ系の空文字 → NULL 正規化」を実施する（既に実施済みであれば変更不要）
- ERD設計ドキュメント（`docs/project/erd-design/`）の `schema.md` / `design-decisions.md` に物理制約を反映

## 決定日

2026-04-28
