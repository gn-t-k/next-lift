import { defineFactory } from "@praha/drizzle-factory";
import { exercisePlansFactory } from "../exercise-plans/exercise-plans-factory";
import { exercisesFactory } from "../exercises/exercises-factory";
import { schema } from "../index";

export const exercisePlanExercisesFactory = defineFactory({
	schema,
	table: "exercisePlanExercises",
	resolver: ({ use }) => ({
		exercisePlanId: () =>
			use(exercisePlansFactory)
				.create()
				.then((ep) => ep.id),
		exerciseId: () =>
			use(exercisesFactory)
				.create()
				.then((e) => e.id),
	}),
});
