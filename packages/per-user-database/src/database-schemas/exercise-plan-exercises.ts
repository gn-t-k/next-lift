import { index, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { exercisePlans } from "./exercise-plans";
import { exercises } from "./exercises";

export const exercisePlanExercises = sqliteTable(
	"exercise_plan_exercises",
	{
		exercisePlanId: text("exercise_plan_id")
			.primaryKey()
			.references(() => exercisePlans.id),
		exerciseId: text("exercise_id")
			.notNull()
			.references(() => exercises.id),
	},
	(table) => [
		index("exercise_plan_exercises_exercise_id_idx").on(table.exerciseId),
	],
);
