import { generateId } from "@next-lift/utilities/generate-id";
import { defineFactory } from "@praha/drizzle-factory";
import { exercisesFactory } from "../exercises/exercises-factory";
import { schema } from "../index";
import { workoutsFactory } from "../workouts/workouts-factory";

export const exerciseLogsFactory = defineFactory({
	schema,
	table: "exerciseLogs",
	resolver: ({ sequence, use }) => ({
		id: generateId(),
		workoutId: () =>
			use(workoutsFactory)
				.create()
				.then((w) => w.id),
		exerciseId: () =>
			use(exercisesFactory)
				.create()
				.then((e) => e.id),
		memo: null,
		displayOrder: sequence,
	}),
});
