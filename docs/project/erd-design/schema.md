# ERDスキーマ定義

## Mermaid ERD

```mermaid
erDiagram
    programs ||--o{ days : "has"
    days ||--o{ exercise_plans : "has"
    exercise_plans ||--o{ set_plans : "has"
    set_plans ||--|| weight_reps_params : "params"
    set_plans ||--|| weight_rpe_params : "params"
    set_plans ||--|| reps_rpe_params : "params"
    exercises ||--o{ exercise_plan_exercises : "target"
    exercise_plan_exercises ||--|| exercise_plans : "linked to"
    exercises ||--o{ exercise_logs : "target"
    exercises ||--o{ one_rep_maxes : "has"
    workouts ||--o{ exercise_logs : "has"
    workouts ||--o| workout_completions : "completed as"
    workouts ||--o| workout_day_links : "linked to"
    days ||--o{ workout_day_links : "linked from"
    exercise_logs ||--o{ set_logs : "has"

    programs {
        id text PK
        name text
        meta_info text "nullable"
    }
    days {
        id text PK
        program_id text FK
        label text
        display_order integer
        meta_info text "nullable"
    }
    exercise_plans {
        id text PK
        day_id text FK
        display_order integer
        meta_info text "nullable"
    }
    exercise_plan_exercises {
        exercise_plan_id text "PK FK"
        exercise_id text FK
    }
    set_plans {
        id text PK
        exercise_plan_id text FK
        plan_type text "NOT NULL"
        display_order integer
        meta_info text "nullable"
    }
    weight_reps_params {
        set_plan_id text "PK FK"
        weight_value real
        weight_type text
        weight_input_unit text
        reps integer
    }
    weight_rpe_params {
        set_plan_id text "PK FK"
        weight_value real
        weight_type text
        weight_input_unit text
        rpe real
    }
    reps_rpe_params {
        set_plan_id text "PK FK"
        reps integer
        rpe real
    }
    exercises {
        id text PK
        name text
    }
    one_rep_maxes {
        id text PK
        exercise_id text FK
        weight_kg real
        weight_input_unit text
        achieved_at integer
        registered_at integer
    }
    workouts {
        id text PK
        started_at integer
    }
    workout_day_links {
        id text PK
        workout_id text "FK UK"
        day_id text FK
    }
    workout_completions {
        id text PK
        workout_id text "FK UK"
        completed_at integer
    }
    exercise_logs {
        id text PK
        workout_id text FK
        exercise_id text FK
        memo text "nullable"
        display_order integer
    }
    set_logs {
        id text PK
        exercise_log_id text FK
        weight_kg real
        weight_input_unit text
        reps integer
        rpe real "nullable"
        memo text "nullable"
        display_order integer
    }
```

## テーブル分類

| カテゴリ | テーブル | 説明 |
|---------|---------|------|
| 計画系 | programs | トレーニング計画の単位 |
| | days | プログラム内の1日分の計画単位 |
| | exercise_plans | Day内の1種目分の計画枠。種目未確定のプレースホルダーも可 |
| | exercise_plan_exercises | exercise_plansとexercisesのリンク。行あり=種目確定、行なし=プレースホルダー |
| | set_plans | 1セット分のパラメータの基底テーブル。plan_typeで3パターンを区別 |
| | weight_reps_params | セット計画パラメータ（重量+回数） |
| | weight_rpe_params | セット計画パラメータ（重量+RPE） |
| | reps_rpe_params | セット計画パラメータ（回数+RPE） |
| 記録系 | workouts | ジム1回分の実行記録 |
| | workout_day_links | workoutsとdaysのリンク。行あり=Day準拠、行なし=フリーワークアウト |
| | workout_completions | ワークアウト完了イベント。行あり=完了、行なし=進行中 |
| | exercise_logs | ワークアウト内の1種目分の記録 |
| | set_logs | 1セット分の実績 |
| マスタ系 | exercises | トレーニングで行う動作の種類 |
| | one_rep_maxes | 種目ごとの1RM記録。INSERT only（イベント化）。最新レコードが現在の1RM |

## リレーションシップ

| 関係 | 多重度 | 説明 |
|------|--------|------|
| programs → days | 1:0..n | 0はプログラム作成途中の状態 |
| days → exercise_plans | 1:0..n | 種目未配置のDayは作成途中で正当 |
| exercise_plans → set_plans | 1:0..n | セット設定前の途中保存を許容 |
| set_plans → パラメータテーブル | 1:1（排他） | plan_typeに応じて3テーブルのうち1つに行が存在 |
| exercise_plans → exercise_plan_exercises | 1:0..1 | 行なし=プレースホルダー枠 |
| exercises → exercise_plan_exercises | 1:0..n | 同一種目が複数の計画枠に使用可 |
| exercises → exercise_logs | 1:0..n | 記録のない種目が正当 |
| exercises → one_rep_maxes | 1:0..n | 1RM未設定の種目が正当。イベント化で複数行 |
| workouts → exercise_logs | 1:0..n | ワークアウト開始直後の状態を許容 |
| exercise_logs → set_logs | 1:0..n | 種目追加直後の状態を許容 |
| workouts → workout_completions | 1:0..1 | 行なし=進行中、行あり=完了 |
| workouts → workout_day_links | 1:0..1 | 行なし=フリーワークアウト |
| days → workout_day_links | 1:0..n | 同じDayを複数回実施可能 |

## カラム設計の補足

### 重量関連

- **weight_kg**: 常にkg単位で保存。lbs入力時もkgに変換して格納
- **weight_input_unit**: 入力時の単位（"kg" / "lbs"）。表示層でkg/lbs変換に使用。種目別デフォルト単位の導出元
- **weight_value**: セット計画の重量指定値。weight_typeが"kg"ならkg値、"percent_1rm"なら%値
- **weight_type**: 重量指定の種類。"kg"=絶対重量、"percent_1rm"=1RMに対する相対指定。「単位」ではなく「種類」の区分

### タイムスタンプ

全てinteger型、ms精度。汎用名（created_at/updated_at）ではなくドメインの事実に即した名前:

- **started_at**: ワークアウト開始日時
- **completed_at**: ワークアウト完了日時
- **achieved_at**: 1RM達成日時（ユーザー入力。推移グラフのX軸）
- **registered_at**: 1RMレコード登録日時（システム自動設定）

### plan_type

set_plansのplan_typeは3値: "weight_reps" / "weight_rpe" / "reps_rpe"。対応するパラメータテーブルに1行存在する。排他制御はアプリ側。

### nullable カラム（7件）

| テーブル | カラム | 意味 |
|---------|--------|------|
| programs | meta_info | 漸進ルール等のフリーテキスト |
| days | meta_info | Dayの補足（「上半身の日」等） |
| exercise_plans | meta_info | プレースホルダー枠の説明（「スクワット系アクセサリー」等） |
| set_plans | meta_info | セットの補足（「ウォームアップ」「AMRAP」等） |
| exercise_logs | memo | 種目に対するメモ |
| set_logs | rpe | 主観的運動強度（任意入力） |
| set_logs | memo | セットに対するメモ |
