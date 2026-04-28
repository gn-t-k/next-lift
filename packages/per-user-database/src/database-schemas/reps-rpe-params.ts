import { sql } from "drizzle-orm";
import {
	check,
	integer,
	real,
	sqliteTable,
	text,
} from "drizzle-orm/sqlite-core";
import { setPlans } from "./set-plans";

export const repsRpeParams = sqliteTable(
	"reps_rpe_params",
	{
		setPlanId: text("set_plan_id")
			.primaryKey()
			.references(() => setPlans.id),
		reps: integer("reps").notNull(),
		rpe: real("rpe").notNull(),
	},
	(table) => [
		check("reps_rpe_params_reps_check", sql`${table.reps} > 0`),
		check("reps_rpe_params_rpe_check", sql`${table.rpe} BETWEEN 1 AND 10`),
	],
);
