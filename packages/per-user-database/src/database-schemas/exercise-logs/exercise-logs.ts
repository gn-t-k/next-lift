import { sql } from "drizzle-orm";
import {
	check,
	index,
	integer,
	sqliteTable,
	text,
} from "drizzle-orm/sqlite-core";
import { exercises } from "../exercises/exercises";
import { workouts } from "../workouts/workouts";

export const exerciseLogs = sqliteTable(
	"exercise_logs",
	{
		id: text("id").primaryKey(),
		workoutId: text("workout_id")
			.notNull()
			.references(() => workouts.id),
		exerciseId: text("exercise_id")
			.notNull()
			.references(() => exercises.id),
		memo: text("memo"),
		displayOrder: integer("display_order").notNull(),
	},
	(table) => [
		index("exercise_logs_workout_id_idx").on(table.workoutId),
		index("exercise_logs_exercise_id_idx").on(table.exerciseId),
		check(
			"exercise_logs_memo_length_check",
			sql`${table.memo} IS NULL OR length(${table.memo}) BETWEEN 1 AND 10000`,
		),
		check("exercise_logs_display_order_check", sql`${table.displayOrder} >= 0`),
	],
);
