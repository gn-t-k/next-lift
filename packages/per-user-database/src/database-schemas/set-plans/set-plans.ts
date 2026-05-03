import { sql } from "drizzle-orm";
import {
	check,
	index,
	integer,
	sqliteTable,
	text,
} from "drizzle-orm/sqlite-core";
import { exercisePlans } from "../exercise-plans/exercise-plans";

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
	(table) => [
		index("set_plans_exercise_plan_id_idx").on(table.exercisePlanId),
		check(
			"set_plans_meta_info_length_check",
			sql`${table.metaInfo} IS NULL OR length(${table.metaInfo}) BETWEEN 1 AND 10000`,
		),
		check("set_plans_display_order_check", sql`${table.displayOrder} >= 0`),
	],
);
