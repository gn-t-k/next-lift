import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { setPlans } from "./set-plans";

export const repsRpeParams = sqliteTable("reps_rpe_params", {
	setPlanId: text("set_plan_id")
		.primaryKey()
		.references(() => setPlans.id),
	reps: integer("reps").notNull(),
	rpe: real("rpe").notNull(),
});
