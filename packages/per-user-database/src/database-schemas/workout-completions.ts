import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { workouts } from "./workouts";

export const workoutCompletions = sqliteTable("workout_completions", {
	id: text("id").primaryKey(),
	workoutId: text("workout_id")
		.notNull()
		.unique()
		.references(() => workouts.id),
	completedAt: integer("completed_at", { mode: "timestamp_ms" }).notNull(),
});
