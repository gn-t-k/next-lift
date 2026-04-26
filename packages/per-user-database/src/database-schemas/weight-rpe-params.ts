import { real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { setPlans } from "./set-plans";

/**
 * weight_type: "kg" | "percent_1rm" （アプリ側定数で管理）
 * weight_input_unit: "kg" | "lbs" （アプリ側定数で管理）
 */
export const weightRpeParams = sqliteTable("weight_rpe_params", {
	setPlanId: text("set_plan_id")
		.primaryKey()
		.references(() => setPlans.id),
	weightValue: real("weight_value").notNull(),
	weightType: text("weight_type").notNull(),
	weightInputUnit: text("weight_input_unit").notNull(),
	rpe: real("rpe").notNull(),
});
