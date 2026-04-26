import { defineFactory } from "@praha/drizzle-factory";
import { schema } from "../../database-schemas";
import { exercisePlansFactory } from "./exercise-plans-factory";
import { exercisesFactory } from "./exercises-factory";

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
