import { real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { setPlans } from "./set-plans";

export const weightRpeParams = sqliteTable("weight_rpe_params", {
	setPlanId: text("set_plan_id")
		.primaryKey()
		.references(() => setPlans.id),
	weightValue: real("weight_value").notNull(),
	weightType: text("weight_type").notNull(),
	weightInputUnit: text("weight_input_unit").notNull(),
	rpe: real("rpe").notNull(),
});
