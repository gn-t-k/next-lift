# ADR-027: weight_input_unit の保持位置と関心事の分離

## ステータス

Accepted

## コンテキスト

ERD設計判断 #21（`docs/project/erd-design/design-decisions.md`）でlbs対応のために `weight_input_unit text NOT NULL` を以下4テーブルに追加していた。

- `weight_reps_params`（セット計画パラメータ）
- `weight_rpe_params`（セット計画パラメータ）
- `set_logs`（セット記録）
- `one_rep_maxes`（1RM記録）

意味付けは「内部kg統一 + 表示層変換。per-record単位保存で種目別デフォルト単位（前回の入力単位をプリセット）を実現」というもので、`set_logs` の直近行を読むことで「種目別デフォルト入力単位」を導出する設計だった。

### 表面化した問題

PR #660 のスキーマレビューで以下の意味のオーバーロードが露見した。

`weight_reps_params` / `weight_rpe_params` の `weight_value` は `weight_type` によって解釈が変わる:

- `weight_type = "kg"`: `weight_value` は kg 値、`weight_input_unit` は入力単位として意味を持つ
- `weight_type = "percent_1rm"`: `weight_value` は 1RM に対する%値（無単位）。**`weight_input_unit` は構造上 NOT NULL だが、入れる値に意味がない**

意味付けの再解釈案も両方歪んでいた:

| 案 | 解釈 | 問題 |
| --- | --- | --- |
| A | 「実行時の解決重量の表示単位」 | カラム名（=入力単位）と意味が乖離 |
| B | 「次回入力単位プリセットのため」 | 種目単位の関心事を各 set_plan 行が持つのは不自然 |

根本原因: 「計画パラメータ（指定値）」「実績記録（事実値）」「種目設定（プリセット）」という性質の異なる関心事が、同名カラムで4テーブルに散らばっていた。

### 関連する既存方針

- ERD設計判断 #19: nullable排除方針（任意属性は別テーブルに分離）
- ERD設計判断 #12, #14: 記録系の不可逆性（過去記録は事実として残す）
- ADR-005: Per-User Database構成
- ADR-026: Per-User Database のFK制約方針

## 論点

### 論点1: 種目ごとのデフォルト/プリセット単位をどこに保持するか

| 案 | 概要 | Pros | Cons |
| --- | --- | --- | --- |
| **1A: `exercises.default_weight_input_unit` カラム** | 種目マスタにデフォルト単位を直接持つ | 1テーブルで完結しJOIN単純。種目登録直後でも機能する。「種目ごとの関心事」と素直に対応 | 自動更新するなら書き込みパスがUC_B_2/UC_B_3/UC_D_1にぶら下がる。NOT NULL DEFAULT `'kg'` だと初回登録時にユーザー意図と無関係な値になり得る |
| 1B: `exercise_unit_preferences` 独立テーブル | exercise_id PK + preferred_unit の1:1テーブル | 「設定がある/ない」を行の有無で表現でき nullable 排除 | 1属性のための1:1テーブルは過剰正規化。LEFT JOIN が増える |
| 1C: 保持せず `set_logs` 直近値から動的導出のみ | テーブル変更なし、UC_B_2 のクエリ流用 | 追加変更ゼロ、設計判断 #21 の主旨そのもの | 種目を1度も記録していないと導出できず、初回入力時のデフォルトはアプリ側ハードコード（kg）になる。lbs派ユーザーの初回体験が劣化 |
| 1D: ユーザー全体で1つだけ（user_settings 的） | 全種目共通で1つ | テーブルが小さい | 設計判断 #21 の根拠（複数ジム kg/lbs 混在・種目別差異）を捨てる |

### 論点2: パラメータテーブルの `weight_input_unit` をどう扱うか

| 案 | 概要 | Pros | Cons |
| --- | --- | --- | --- |
| **2A: 完全削除** | DROP COLUMN | 意味のオーバーロード問題が根本解決。計画は「指定」、種目設定は別、と関心事を分離 | UC_E_2（計画値プリフィル）の表示単位決定はアプリ側で `exercises.default_weight_input_unit` から導出する必要がある |
| 2B: NULLABLE化（kg時のみ値あり） | `weight_type=percent_1rm` のとき NULL 許容 | 既存データ移行が軽い | nullable排除方針（#19）と逆行。関心事の混在は残る |

### 論点3: 実績記録系（`set_logs`, `one_rep_maxes`）の `weight_input_unit`

| 案 | 概要 | Pros | Cons |
| --- | --- | --- | --- |
| **3A: 残す（実際の入力記録として）** | 事実値として保持 | 「ユーザーがどの単位で入力したか」は不変の事実。後から表示単位を切り替えても本来の入力体験を再現できる。記録の不可逆性（#12, #14）と整合 | 表示層は「保存された入力単位 vs 種目プリセット」のどちらを優先するかロジックが必要 |
| 3B: 削除（種目プリセットに集約） | DROP COLUMN | スキーマがシンプル | 過去入力単位という事実が失われ、ユーザーが種目プリセットを切り替えると過去記録の表示単位も追従し、事実の改変感が出る |

## 決定内容

**論点1=1A、論点2=2A、論点3=3A を採用する。**

具体的には:

1. **`exercises` テーブルに `default_weight_input_unit text NOT NULL DEFAULT 'kg'` を追加**
2. **`weight_reps_params.weight_input_unit` / `weight_rpe_params.weight_input_unit` を完全削除（DROP COLUMN）**
3. **`set_logs.weight_input_unit` / `one_rep_maxes.weight_input_unit` は残す**

### カラム名

`default_weight_input_unit` を採用する。

- `weight_input_unit`（set_logs と同名）案: 関心事は同じだが「事実 vs デフォルト設定」の意味差をカラム名から区別できない
- `weight_unit` 案: 内部kg統一というルールと衝突し誤解を招く
- `default_unit` 案: 将来 distance unit などが出ると曖昧
- **`default_weight_input_unit` 案**: `default_` プレフィックスで「設定」、`weight_input_unit` で関心事の対応を明示

### `default_weight_input_unit` の更新タイミング

(1) 種目詳細ビューでの明示編集、(2) セット記録/1RM登録時に異なる単位入力があったらモードレスダイアログで確認して更新、の2系統。

セット記録時に毎回 last-write-wins で自動上書きはしない。「1回だけ別単位で入力したら prefer が変わる」副作用を避けるため、ユーザーの明示的な意思決定をUIで挟む。

メモリルール「ユーザーデータには編集・削除手段が必要」に従い、種目詳細ビューでの編集UIは必須。

### 表示層の単位優先順位

- 過去レコード表示時: その行の `weight_input_unit`（事実）
- 新規入力フォームの初期値: `exercises.default_weight_input_unit`（プリセット）

### DB制約方針

`default_weight_input_unit` も他の区分値カラム（`plan_type`, `weight_type`, `weight_input_unit`）と同じく **DB enum/CHECK は使わずアプリ側定数で管理** する。理由はメモリルール「DB enum/CHECK制約は使わない」に従う。

## 採用理由

1. **計画/実績/種目設定という性質の異なる関心事を3層に分離する**: それぞれ意味が明確で、`weight_type=percent_1rm` のような特殊ケースで意味が破綻しない
2. **JOIN複雑性は正規化を避ける理由にならない**（メモリルール準拠）: 1A は1属性追加であり、JOIN が増えるわけではない。1B は1属性のための1:1テーブルで過剰
3. **記録の不可逆性**: 設計判断 #12, #14 の精神に則り、過去入力単位という事実を残す（3A）
4. **lbs派ユーザーの初回体験を保護**: 1C を選ぶと初回入力時にハードコード kg にフォールバックし、lbs派ユーザーが毎回切替必要になる
5. **ユーザー編集手段の確保**: 種目詳細ビューで編集可能、かつセット記録時にも変更導線を提供する。ユーザーデータには編集・削除手段を用意するメモリルールと整合
6. **記録系を残す前提でも整合する**: 3A により実績の事実値が残るため、案1A の `default_weight_input_unit` を「ユーザーが明示しなかった場合の暫定値」として位置付けられる

## 代替案で却下した理由

### 1B（独立テーブル `exercise_unit_preferences`）

1属性のための1:1テーブルは過剰正規化。将来「単位以外の種目別ユーザー設定」が出てきた時に切り出す方が合理的で、現時点では不要。

### 1C（保持せず動的導出のみ）

種目を1度も記録していない初回入力時に lbs 派ユーザーが毎回 kg→lbs 切替する必要があり、設計判断 #21 が解決しようとしたユーザー体験要件を再び損なう。

### 1D（ユーザー全体で1つ）

設計判断 #21 の根拠である「複数ジム kg/lbs 混在・種目別差異」というユーザー要件と矛盾するため不採用。

### 2B（NULLABLE化）

nullable 排除方針（#19）と逆行。`weight_type=percent_1rm` のとき意味のないカラムが残るのは関心事の混在を解消できていない。

### 3B（記録系も削除）

過去入力単位という事実が失われる。ユーザーが種目プリセットを切り替えると過去記録の表示単位も追従し、事実の改変感が出る。記録の不可逆性（#12, #14）と矛盾。

## 結果・影響

### メリット

- `weight_type=percent_1rm` 時の意味のオーバーロード解消
- 計画パラメータが「指定」のみ、実績が「事実」のみ、種目設定が「プリセット」のみと、関心事ごとに保持位置が分かれる
- ユーザーの明示的な意思決定（種目詳細ビュー編集、ダイアログ確認）が UI に組み込まれ、副作用的な単位変更が起きない

### デメリット・注意事項

- 表示層に「過去レコード時は当時の単位、新規入力時はプリセット」という優先順序ロジックが必要
- セット記録/1RM登録時、入力単位が `default_weight_input_unit` と異なるときモードレスダイアログを表示するUI実装が必要
- 種目詳細ビューに `default_weight_input_unit` 編集UIが必要
- マイグレーションで `weight_reps_params` / `weight_rpe_params` から `weight_input_unit` を DROP COLUMN するため、既存データ（dev/local）はリセットが必要

### 波及範囲

- `packages/per-user-database/src/database-schemas/exercises.ts` に `defaultWeightInputUnit` 追加
- `packages/per-user-database/src/database-schemas/weight-reps-params.ts` から `weightInputUnit` 削除
- `packages/per-user-database/src/database-schemas/weight-rpe-params.ts` から `weightInputUnit` 削除
- `packages/per-user-database/drizzle/0001_*.sql`（新規マイグレーション）
- `packages/per-user-database/src/testing/factories/exercises-factory.ts` に `defaultWeightInputUnit` 追加
- `packages/per-user-database/src/testing/factories/weight-reps-params-factory.ts` から `weightInputUnit` 削除
- `packages/per-user-database/src/testing/factories/weight-rpe-params-factory.ts` から `weightInputUnit` 削除
- ERD設計ドキュメント（`docs/project/erd-design/`）の `schema.md` / `design-decisions.md` / `use-case-queries.md` / `index.md` / `workspace.md` を本ADRに合わせて更新
- アプリ層（`apps/web`, `apps/ios`）の参照修正・UI実装（種目詳細ビュー編集、セット記録/1RM登録時の単位変更確認ダイアログ）は **本ADRのスコープ外**。別Issueで管理する

## 決定日

2026-04-27
