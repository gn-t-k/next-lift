import { index, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { exercisePlans } from "./exercise-plans";
import { exercises } from "./exercises";

/**
 * 行あり = 種目確定済みの計画枠、行なし = プレースホルダー枠（種目未確定）。
 * exercise_plans.exercise_id の nullable FK を排除するためのリンクテーブル化。
 * 1:1関係のため exercise_plan_id を PK 兼 FK とする（ERD design-decisions #25 / #29）。
 */
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
