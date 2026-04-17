# ユースケース別 擬似SQL

全27ユースケースの読み取り(R)・書き込み(W)の擬似SQL。JOINパスやカラムの使い方を確認する際に参照する。

## A. プログラム作成

| # | ユースケース | 擬似SQL | 結果 |
| --- | --- | --- | --- |
| UC_A_1 | プログラム新規作成 | **W:** `INSERT INTO programs (id, name) VALUES (...);` `INSERT INTO days (id, program_id, label, display_order) VALUES (...);` ※Dayは0件でも保存可能（途中保存。設計判断#23） | OK |
| UC_A_2 | プログラム複製 | **R:** `SELECT * FROM programs WHERE id = ?;` `SELECT * FROM days WHERE program_id = ?;` `SELECT * FROM exercise_plans WHERE day_id IN (...);` `SELECT * FROM exercise_plan_exercises WHERE exercise_plan_id IN (...);` `SELECT sp.*, wrp.weight_value, wrp.weight_type, wrp.weight_input_unit, wrp.reps, wrpp.weight_value, wrpp.weight_type, wrpp.weight_input_unit, wrpp.rpe, rrp.reps, rrp.rpe FROM set_plans sp LEFT JOIN weight_reps_params wrp ON wrp.set_plan_id = sp.id LEFT JOIN weight_rpe_params wrpp ON wrpp.set_plan_id = sp.id LEFT JOIN reps_rpe_params rrp ON rrp.set_plan_id = sp.id WHERE sp.exercise_plan_id IN (...);` **W:** 読み取った全データを新しいIDでINSERT（programs → days → exercise_plans → exercise_plan_exercises → set_plans → パラメータテーブル。パラメータテーブルのweight_input_unitも含め全カラムを複製） | OK |
| UC_A_3 | Day構成編集 | **W:** `INSERT INTO days (id, program_id, label, display_order) VALUES (...);` `UPDATE days SET label = ?, display_order = ?, meta_info = ? WHERE id = ?;` `DELETE FROM days WHERE id = ?;` | OK |
| UC_A_4 | 種目配置 | **W:** `INSERT INTO exercise_plans (id, day_id, display_order, meta_info) VALUES (...);` `INSERT INTO exercise_plan_exercises (exercise_plan_id, exercise_id) VALUES (...);` `INSERT INTO set_plans (id, exercise_plan_id, plan_type, display_order, meta_info) VALUES (...);` `INSERT INTO weight_reps_params (set_plan_id, weight_value, weight_type, weight_input_unit, reps) VALUES (...);` / `INSERT INTO weight_rpe_params (set_plan_id, weight_value, weight_type, weight_input_unit, rpe) VALUES (...);` / `INSERT INTO reps_rpe_params (set_plan_id, reps, rpe) VALUES (...);` ※プレースホルダー枠の場合はexercise_plan_exercisesへのINSERTを省略し、exercise_plans.meta_infoに説明を記述 | OK |
| UC_A_5 | メタ情報記録 | **W:** `UPDATE programs SET meta_info = ? WHERE id = ?;` ※days, exercise_plans, set_plansのmeta_infoも同パターンで更新可能 | OK |
| UC_A_6 | プログラム編集 | **W:** `UPDATE programs SET name = ?, meta_info = ? WHERE id = ?;` `UPDATE days SET label = ?, display_order = ?, meta_info = ? WHERE id = ?;` `UPDATE exercise_plans SET display_order = ?, meta_info = ? WHERE id = ?;` `UPDATE set_plans SET plan_type = ?, display_order = ?, meta_info = ? WHERE id = ?;` + パラメータテーブルのDELETE→INSERT（weight_input_unitを含む全カラム） | OK |
| UC_A_7 | プログラム削除 | **W:** `DELETE FROM programs WHERE id = ?;` + CASCADE的に days, exercise_plans, exercise_plan_exercises, set_plans, パラメータテーブル（weight_reps_params, weight_rpe_params, reps_rpe_params）を削除（アプリ側で順序制御。子→親の順に削除） | OK |
| UC_A_8 | 種目一覧閲覧 | **R:** `SELECT e.*, (SELECT orm.weight_kg, orm.weight_input_unit FROM one_rep_maxes orm WHERE orm.exercise_id = e.id ORDER BY orm.registered_at DESC LIMIT 1) AS current_1rm FROM exercises e ORDER BY e.name;` ※weight_input_unitを取得し、表示層でkg/lbs変換 | OK |
| UC_A_9 | 種目名編集 | **W:** `UPDATE exercises SET name = ? WHERE id = ?;` | OK |
| UC_A_10 | 種目登録 | **W:** `INSERT INTO exercises (id, name) VALUES (...);` | OK |
| UC_A_11 | 種目削除 | **W:** `DELETE FROM exercises WHERE id = ?;` + exercise_plan_exercises, exercise_logs, set_logs, one_rep_maxesの関連レコード削除（アプリ側で制御。子→親の順に削除） | OK |

## B. トレーニング記録

| # | ユースケース | 擬似SQL | 結果 |
| --- | --- | --- | --- |
| UC_B_1 | プログラム選択 | **R:** `SELECT p.* FROM programs p ORDER BY p.name;` ※直近使用のサジェスト（UC_E_3）は別途 | OK |
| UC_B_2 | セット記録 | **W:** `INSERT INTO workouts (id, started_at) VALUES (...);` `INSERT INTO workout_day_links (id, workout_id, day_id) VALUES (...);` `INSERT INTO exercise_logs (id, workout_id, exercise_id, display_order) VALUES (...);` `INSERT INTO set_logs (id, exercise_log_id, weight_kg, weight_input_unit, reps, display_order) VALUES (...);` ※weight_input_unitにユーザーの入力単位（"kg" / "lbs"）を保存。weight_kgには常にkg単位に変換した値を保存 ※プリフィル時の種目取得: `SELECT epe.exercise_id FROM exercise_plan_exercises epe WHERE epe.exercise_plan_id IN (...);`（exercise_plan_exercises経由で種目を特定） ※種目別デフォルト入力単位: `SELECT sl.weight_input_unit FROM set_logs sl JOIN exercise_logs el ON el.id = sl.exercise_log_id WHERE el.exercise_id = ? ORDER BY sl.display_order DESC LIMIT 1;`（直近の入力単位をプリセット） | OK |
| UC_B_3 | 記録値修正 | **W:** `UPDATE set_logs SET weight_kg = ?, weight_input_unit = ?, reps = ? WHERE id = ?;` ※入力単位の変更も反映 | OK |
| UC_B_4 | RPE・メモ追加 | **W:** `UPDATE set_logs SET rpe = ?, memo = ? WHERE id = ?;` | OK |
| UC_B_5 | ワークアウト完了 | **W:** `INSERT INTO workout_completions (id, workout_id, completed_at) VALUES (...);` | OK |
| UC_B_6 | ワークアウト削除 | **W:** `DELETE FROM workouts WHERE id = ?;` + workout_day_links, workout_completions, exercise_logs, set_logsの関連レコード削除（アプリ側で順序制御。子→親の順に削除） | OK |
| UC_B_7 | ワークアウト事後修正 | **W:** `UPDATE set_logs SET weight_kg = ?, weight_input_unit = ?, reps = ?, rpe = ?, memo = ? WHERE id = ?;` `UPDATE exercise_logs SET memo = ? WHERE id = ?;` | OK |

## C. 振り返り

| # | ユースケース | 擬似SQL | 結果 |
| --- | --- | --- | --- |
| UC_C_1 | 計画実績比較 | **R(計画):** `SELECT ep.display_order, ep.meta_info, epe.exercise_id, e.name, sp.plan_type, sp.meta_info AS set_meta_info, wrp.weight_value, wrp.weight_type, wrp.weight_input_unit, wrp.reps, wrpp.weight_value, wrpp.weight_type, wrpp.weight_input_unit, wrpp.rpe, rrp.reps, rrp.rpe FROM exercise_plans ep LEFT JOIN exercise_plan_exercises epe ON epe.exercise_plan_id = ep.id LEFT JOIN exercises e ON e.id = epe.exercise_id JOIN set_plans sp ON sp.exercise_plan_id = ep.id LEFT JOIN weight_reps_params wrp ON wrp.set_plan_id = sp.id LEFT JOIN weight_rpe_params wrpp ON wrpp.set_plan_id = sp.id LEFT JOIN reps_rpe_params rrp ON rrp.set_plan_id = sp.id WHERE ep.day_id = ? ORDER BY ep.display_order, sp.display_order;` **R(実績):** `SELECT el.display_order, e.name, sl.weight_kg, sl.weight_input_unit, sl.reps, sl.rpe FROM exercise_logs el JOIN exercises e ON e.id = el.exercise_id JOIN set_logs sl ON sl.exercise_log_id = el.id JOIN workouts w ON w.id = el.workout_id JOIN workout_day_links wdl ON wdl.workout_id = w.id WHERE wdl.day_id = ? ORDER BY el.display_order, sl.display_order;` ※計画と実績を種目(exercise_id)でマッチングし、セットのdisplay_orderで対比。exercise_plan_exercisesがLEFT JOINなのはプレースホルダー枠（種目未確定）を含むため。weight_input_unitを取得して表示層でkg/lbs変換 | OK |
| UC_C_2 | 強度・ボリューム推移確認 | **R:** `SELECT w.started_at, sl.weight_kg, sl.weight_input_unit, sl.reps, sl.rpe FROM set_logs sl JOIN exercise_logs el ON el.id = sl.exercise_log_id JOIN workouts w ON w.id = el.workout_id WHERE el.exercise_id = ? ORDER BY w.started_at;` ※e1RM = weight_kg * (1 + reps / 30)、ボリューム = weight_kg * reps、%1RM = weight_kg / 1RMはアプリ側で算出。weight_input_unitは表示層で使用 | OK |

## D. 1RM

| # | ユースケース | 擬似SQL | 結果 |
| --- | --- | --- | --- |
| UC_D_1 | 1RM登録更新 | **W:** `INSERT INTO one_rep_maxes (id, exercise_id, weight_kg, weight_input_unit, achieved_at, registered_at) VALUES (...);` ※イベント化のため常にINSERT。最新レコード（registered_at DESC LIMIT 1）が「現在の1RM」。weight_input_unitにユーザーの入力単位を保存 | OK |
| UC_D_2 | e1RM採用 | **R:** e1RMはset_logsから算出（UC_E_1参照）。**W:** `INSERT INTO one_rep_maxes (id, exercise_id, weight_kg, weight_input_unit, achieved_at, registered_at) VALUES (...);` ※e1RM算出元セットの日時をachieved_atに設定。weight_input_unitは算出元セットのweight_input_unitを引き継ぐ | OK |
| UC_D_3 | 1RM削除 | **W:** `DELETE FROM one_rep_maxes WHERE exercise_id = ?;` ※該当種目の全レコードを物理DELETE（「クリア」= 完全リセット） | OK |

## E. システム

| # | ユースケース | 擬似SQL | 結果 |
| --- | --- | --- | --- |
| UC_E_1 | e1RM自動算出 | **R:** `SELECT sl.weight_kg, sl.weight_input_unit, sl.reps FROM set_logs sl JOIN exercise_logs el ON el.id = sl.exercise_log_id WHERE el.exercise_id = ? AND sl.reps > 0;` ※Epley公式等はアプリ側で算出。全レコードを取得して最大e1RMを算出する方がSQLの複雑性を避けられる | OK |
| UC_E_2 | 計画値プリフィル | **R:** `SELECT d.id FROM days d WHERE d.program_id = ? ORDER BY d.display_order;` ※次のDayの判定: `SELECT wdl.day_id, MAX(w.started_at) AS last_done FROM workout_day_links wdl JOIN workouts w ON w.id = wdl.workout_id WHERE wdl.day_id IN (...) GROUP BY wdl.day_id;` ※最後に実施されたDayの次のDay（display_order順）を特定 + `SELECT ep.display_order, ep.meta_info, epe.exercise_id, sp.plan_type, sp.display_order AS set_display_order, sp.meta_info AS set_meta_info, wrp.weight_value, wrp.weight_type, wrp.weight_input_unit, wrp.reps, wrpp.weight_value, wrpp.weight_type, wrpp.weight_input_unit, wrpp.rpe, rrp.reps, rrp.rpe FROM exercise_plans ep LEFT JOIN exercise_plan_exercises epe ON epe.exercise_plan_id = ep.id JOIN set_plans sp ON sp.exercise_plan_id = ep.id LEFT JOIN weight_reps_params wrp ON wrp.set_plan_id = sp.id LEFT JOIN weight_rpe_params wrpp ON wrpp.set_plan_id = sp.id LEFT JOIN reps_rpe_params rrp ON rrp.set_plan_id = sp.id WHERE ep.day_id = ? ORDER BY ep.display_order, sp.display_order;` ※exercise_plan_exercisesがLEFT JOINなのはプレースホルダー枠を含むため。プレースホルダー枠（epe.exercise_idがNULL）はプリフィル不可。UIでユーザーに種目選択を促す。weight_input_unitを取得してデフォルト入力単位に反映 | OK |
| UC_E_3 | 直近プログラムサジェスト | **R:** `SELECT p.id, p.name, MAX(w.started_at) AS last_used FROM programs p JOIN days d ON d.program_id = p.id JOIN workout_day_links wdl ON wdl.day_id = d.id JOIN workouts w ON w.id = wdl.workout_id GROUP BY p.id, p.name ORDER BY last_used DESC;` | OK |
| UC_E_4 | 推移データ表示 | **R:** `SELECT w.started_at, sl.weight_kg, sl.weight_input_unit, sl.reps, sl.rpe FROM set_logs sl JOIN exercise_logs el ON el.id = sl.exercise_log_id JOIN workouts w ON w.id = el.workout_id WHERE el.exercise_id = ? ORDER BY w.started_at;` ※UC_C_2と同じクエリ。プログラム設計時に種目の推移データを参照 | OK |
