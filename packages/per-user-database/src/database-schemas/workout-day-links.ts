import { index, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { days } from "./days";
import { workouts } from "./workouts";

/**
 * 行あり = Day準拠ワークアウト、行なし = フリーワークアウト。
 * workouts.day_id の nullable FK を排除するための分離（ERD design-decisions #18）。
 */
export const workoutDayLinks = sqliteTable(
	"workout_day_links",
	{
		id: text("id").primaryKey(),
		workoutId: text("workout_id")
			.notNull()
			.unique()
			.references(() => workouts.id),
		dayId: text("day_id")
			.notNull()
			.references(() => days.id),
	},
	(table) => [index("workout_day_links_day_id_idx").on(table.dayId)],
);
