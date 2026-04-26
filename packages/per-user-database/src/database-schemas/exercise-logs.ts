import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { exercises } from "./exercises";
import { workouts } from "./workouts";

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
	],
);
