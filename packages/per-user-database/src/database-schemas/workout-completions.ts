import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { workouts } from "./workouts";

/**
 * 行あり = 完了済みワークアウト、行なし = 進行中。
 * workouts.completed_at の UPDATE を避け、完了イベントとして INSERT で記録する分離（ERD design-decisions #11）。
 */
export const workoutCompletions = sqliteTable("workout_completions", {
	id: text("id").primaryKey(),
	workoutId: text("workout_id")
		.notNull()
		.unique()
		.references(() => workouts.id),
	completedAt: integer("completed_at", { mode: "timestamp_ms" }).notNull(),
});
