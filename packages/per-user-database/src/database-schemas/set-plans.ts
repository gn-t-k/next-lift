import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { exercisePlans } from "./exercise-plans";

/**
 * plan_type は "weight_reps" | "weight_rpe" | "reps_rpe" のいずれか。
 * アプリ側の定数で管理し、対応するパラメータテーブルに1行存在する。
 */
export const setPlans = sqliteTable(
	"set_plans",
	{
		id: text("id").primaryKey(),
		exercisePlanId: text("exercise_plan_id")
			.notNull()
			.references(() => exercisePlans.id),
		planType: text("plan_type").notNull(),
		displayOrder: integer("display_order").notNull(),
		// 自由記述テキスト。セット計画のメモ等。構造化はアプリ側で行わない（ERD design-decisions #30）
		metaInfo: text("meta_info"),
	},
	(table) => [index("set_plans_exercise_plan_id_idx").on(table.exercisePlanId)],
);
