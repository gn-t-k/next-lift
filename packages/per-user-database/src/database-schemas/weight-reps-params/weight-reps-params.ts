import { sql } from "drizzle-orm";
import {
	check,
	integer,
	real,
	sqliteTable,
	text,
} from "drizzle-orm/sqlite-core";
import { setPlans } from "../set-plans/set-plans";

/**
 * weight_type: "kg" | "percent_1rm" （アプリ側定数で管理）
 */
export const weightRepsParams = sqliteTable(
	"weight_reps_params",
	{
		setPlanId: text("set_plan_id")
			.primaryKey()
			.references(() => setPlans.id),
		weightValue: real("weight_value").notNull(),
		weightType: text("weight_type").notNull(),
		reps: integer("reps").notNull(),
	},
	(table) => [
		check(
			"weight_reps_params_weight_value_check",
			sql`${table.weightValue} >= 0`,
		),
		check("weight_reps_params_reps_check", sql`${table.reps} > 0`),
	],
);
