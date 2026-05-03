# Breakdown: exercises に weight_step カラムを追加

## ステータス

- 状態: 確定
- 現在のフェーズ: 5/5（レビューと確定 完了）
- 最終更新: 2026-05-02

## 要件サマリー

- 元 Issue: [#712 feat(erd): exercises に weight_step を追加して種目ごとの微調整刻みを設定可能にする](https://github.com/gn-t-k/next-lift/issues/712)
- 関連設計判断:
  - ui-design 設計判断 #59: セット計画値編集の微調整UI（`-2.5kg/+2.5kg/-1回/+1回` ステッパー）
  - ADR-027: 重量入力単位の3層分離（`exercises.default_weight_input_unit` の前例）
- スコープ: スキーマ層のみ
  - `exercises` テーブルへの `weight_step` カラム追加（real, NOT NULL, DEFAULT 2.5, CHECK > 0）
  - マイグレーション生成
  - テストファクトリ更新
  - ERD ドキュメント（`schema.md` / `design-decisions.md`）更新
- スコープ外: V13（種目詳細）の編集UI、V3 / V17 のセット計画ステッパー連携 — `unit-views-implementation` の breakdown で別途追跡
- スコープ外: `reps_step`（Issue 記述により ±1回固定で UI ハードコード継続）

## 設計概要

### 影響範囲

- apps/web: なし（読み出し側で型が伝播するが、本breakdownでは編集対象外）
- apps/ios: なし
- packages/per-user-database:
  - `src/database-schemas/exercises.ts` — カラム追加 + CHECK 制約
  - `drizzle/0003_*.sql` — 新規マイグレーション
  - `src/testing/factories/exercises-factory.ts` — `weightStep: 2.5` 追加
- データベーススキーマ: `exercises` テーブルに `weight_step real NOT NULL DEFAULT 2.5` + CHECK `weight_step > 0`
- 外部API連携: なし

### アプローチ

- 既存スキーマ拡張（ADR-027 で `default_weight_input_unit` を追加した手順を踏襲）
- 単位は kg 基準（DEFAULT 2.5 はバーベル系の標準刻み）
- 種目別の刻み量を持つ理由はバーベル系2.5kg / ダンベル系1kg or 0.5kg / ケトルベル4kg と物理的に異なるため
- DEFAULT 値はスキーマに持つ。アプリ側ハードコード（UI fallback）と二重管理しない
- CHECK 制約: `weight_step > 0`（既存の `weight_kg > 0` 等と同パターン。区分値ではなく数値の妥当性検証なので memory `feedback_no_db_enum_check` の対象外）

### 関連ADR

- ADR-027: 種目スキーマに「種目ごとの設定」を持つ前例。`weight_step` も同じ性質（種目の物理特性 + ユーザープリセット）として整合する

## タスクツリー

凡例:
- `[?]` 未展開（さらに分解が必要）
- `[ ]` 葉タスク（TDDで着手可能）
- `[x]` 完了

依存関係: 1 → 2 → 3 の順。1 はスキーマとファクトリ・マイグレーションが互いに依存（型生成のため）。2 / 3 は 1 完了後に並行可能。

### 1. exercises スキーマへの weight_step 追加

- [x] 1.1. Drizzle スキーマに `weightStep` カラムと CHECK 制約を追加
  - 説明: `packages/per-user-database/src/database-schemas/exercises.ts` に `weightStep: real("weight_step").notNull().default(2.5)` を追加し、`check("exercises_weight_step_check", sql\`${table.weightStep} > 0\`)` を `(table) => [...]` の配列に追加する
  - 完了条件:
    - 型: `pnpm type-check` が通ること
    - 確認: `exercises.ts` に `weight_step` カラム定義と CHECK 制約が記述されている
- [x] 1.2. exercisesFactory に `weightStep: 2.5` を追加
  - 説明: `packages/per-user-database/src/testing/factories/exercises-factory.ts` の resolver の戻り値に `weightStep: 2.5` を追加する
  - 完了条件:
    - 型: `pnpm type-check` が通ること（factory の型がスキーマ型と整合）
- [x] 1.3. マイグレーションを生成
  - 説明: `packages/per-user-database` で `pnpm migration:generate` を実行し、`drizzle/0003_*.sql` を生成する
  - 完了条件:
    - 確認: `drizzle/0003_*.sql` が生成され、`exercises` への `weight_step real NOT NULL DEFAULT 2.5` 追加と CHECK 制約が含まれている
    - 確認: 既存行に対して DEFAULT 2.5 が適用される SQL になっている（SQLite の制約上 `__new_exercises` テーブル経由の再構築になる想定）
  - 補足: drizzle-kit が生成した `__new_exercises` 経由の再作成 SQL は libsql/turso 環境で `sqlite_autoindex___new_exercises_1 already exists` の名前衝突エラーになるため、`ALTER TABLE exercises ADD COLUMN weight_step real NOT NULL DEFAULT 2.5 CONSTRAINT exercises_weight_step_check CHECK (weight_step > 0)` の単一 ALTER 文に手動で書き換えた。CHECK 制約のインライン指定で table-recreation を回避
- [x] 1.4. 既存テストでマイグレーション適用と既定値挙動を回帰検証
  - 説明: `pnpm test` を `packages/per-user-database` で実行し、マイグレーション適用が成功し、ファクトリ経由 / 直接 INSERT で既定値 2.5 が反映されることを確認する。既存テストでカバーされない場合のみ統合テストを1件追加（`weight_step` 未指定時に 2.5 / `weight_step = 0` で CHECK 違反）
  - 完了条件:
    - テスト: `pnpm test` が pass すること
    - テスト（必要時）: `weight_step` 未指定 INSERT で 2.5 が入ること、`weight_step = 0` で CHECK 制約違反になること

### 2. ERD ドキュメントの更新

- [x] 2.1. `schema.md` の Mermaid ERD に `weight_step` を追記
  - 説明: `docs/project/erd-design/schema.md` の `exercises { ... }` ブロック（69〜73行目）に `weight_step real "NOT NULL DEFAULT 2.5"` を追加する
  - 完了条件:
    - 確認: Mermaid ERD の `exercises` テーブルに `weight_step` 行が含まれている
- [x] 2.2. `schema.md` 「重量関連」補足に `weight_step` の説明を追記
  - 説明: `## カラム設計の補足` の `### 重量関連` セクション（155行目以降）に `weight_step` の説明（kg基準・種目ごとに調整可能・DEFAULT 2.5 の根拠）を追加する
  - 完了条件:
    - 確認: `weight_step` の意図と DEFAULT 値の根拠が記述され、`default_weight_input_unit` と並ぶ「種目ごとの設定」として整理されている

### 3. ER 設計判断ログへの記録

- [x] 3.1. `design-decisions.md` に判断 #33 を追記
  - 説明: `docs/project/erd-design/design-decisions.md` の表に #33 を追加する。判断内容は「`exercises.weight_step` を新設し、UI ハードコードでなく種目スキーマで重量微調整刻みを持つ」。理由には Pros / Cons を併記し、ui-design 設計判断 #59 と ADR-027（同じ「種目ごとの設定」位置づけ）への参照を含める。フェーズ列は `post-5`
  - 完了条件:
    - 確認: 表に #33 行が追加され、判断内容・Pros/Cons・参照（#59 / ADR-027）が記述されている

## 議論ログ

### ラウンド1: スコープと CHECK 制約の判断

- Q: V13（種目詳細編集UI）と V3 セット計画ステッパー連携を本Issueに含めるか？
- A: 含めない。V13 / V3 自体が `unit-views-implementation` で未着手のため、それぞれの View 実装時に `weight_step` 連携を取り込む
- 判断: スコープはスキーマ層のみ（カラム追加 + マイグレーション + ファクトリ + ERD ドキュメント + ER 設計判断 #33）

- Q: `weight_step` に CHECK 制約を付けるか？
- A: `CHECK > 0` を付ける
- 判断: 既存の `weight_kg > 0`、`display_order >= 0` 等と同パターン。0 や負値は意味的に不正。memory `feedback_no_db_enum_check` は区分値（enum的な値セット制限）に対する方針であり、数値の範囲妥当性検証は対象外
