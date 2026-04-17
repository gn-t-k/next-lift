# Next Lift ERD設計

## ステータス

- 状態: 完了
- テーブル数: 15（コアエンティティ9 + パラメータテーブル3 + リンクテーブル2 + イベントテーブル1）
- 総カラム数: 61
- nullableカラム: 7（nullable FK: 0）
- 設計判断: 30件
- ユースケース検証: 27/27 OK

## 要件サマリー

- 対象: Per-User Database（ドメインデータ）。認証テーブルはBetter Auth管理の別DBでスコープ外
- Per-User DB構成のため、各テーブルにuser_idカラムは不要
- ORM: Drizzle ORM（sqlite-core）
- 命名規則: テーブル名は複数形snake_case、タイムスタンプはms精度
- 入力資料: [docs/project/ui-design/](../ui-design/)（ドメインモデル、行動シナリオ、ビューとナビゲーション）

## ファイル一覧

| ファイル | 内容 | 利用シーン |
|---------|------|-----------|
| [schema.md](./schema.md) | 最終ERD、テーブル定義、リレーション、カラム設計の補足 | Drizzleスキーマを実装するとき読む。テーブル構造・型・制約を確認する |
| [use-case-queries.md](./use-case-queries.md) | 27ユースケースの擬似SQL | 特定の機能を実装するとき読む。JOINパスやカラムの使い方を確認する |
| [design-decisions.md](./design-decisions.md) | 設計判断ログ（30件） | 「なぜこのテーブル構造なのか」を調べるとき読む |
| [workspace.md](./workspace.md) | 全5フェーズの作業記録 | ERDを修正・拡張するとき読む。設計プロセスの全議論を含む |

## 実装時の注意事項

### weight_type は「単位」ではなく「重量指定の種類」

- "kg" = 絶対重量指定（値はkg単位で保存。lbs入力時もkgに変換）
- "percent_1rm" = 1RMに対する相対指定（値は%）
- lbs対応はweight_typeの値追加ではなく、weight_input_unitカラム + 表示層変換で実現

### プレースホルダー枠

exercise_plan_exercisesにリンク行がないexercise_planはプレースホルダー枠（種目未確定）。exercise_plans.meta_infoに「スクワット系アクセサリー」等の説明を記述。記録時（exercise_logs）は必ず具体的な種目を指定する。

### 「最低1つ」の制約はアプリ側で強制

programs→days等の多重度は0..n（途中保存を許容）。「プログラムにDay最低1つ」「ワークアウトに種目最低1つ」等の制約はワークフローの特定ポイント（完了時等）でアプリ側バリデーションとして実装する。

### one_rep_maxes はイベント化（INSERT only）

1RMの更新はUPDATEではなく新規INSERTで行う。最新レコード（registered_at DESC LIMIT 1）が「現在の1RM」。1RM削除（UC_D_3）は該当exercise_idの全レコードを物理DELETE。
