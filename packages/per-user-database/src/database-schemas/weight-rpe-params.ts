import { sql } from "drizzle-orm";
import { check, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { setPlans } from "./set-plans";

/**
 * weight_type: "kg" | "percent_1rm" （アプリ側定数で管理）
 */
export const weightRpeParams = sqliteTable(
	"weight_rpe_params",
	{
		setPlanId: text("set_plan_id")
			.primaryKey()
			.references(() => setPlans.id),
		weightValue: real("weight_value").notNull(),
		weightType: text("weight_type").notNull(),
		rpe: real("rpe").notNull(),
	},
	(table) => [
		check(
			"weight_rpe_params_weight_value_check",
			sql`${table.weightValue} >= 0`,
		),
		check("weight_rpe_params_rpe_check", sql`${table.rpe} BETWEEN 1 AND 10`),
	],
);
