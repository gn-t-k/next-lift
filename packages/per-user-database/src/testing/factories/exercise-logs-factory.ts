import { generateId } from "@next-lift/utilities/generate-id";
import { defineFactory } from "@praha/drizzle-factory";
import { schema } from "../../database-schemas";
import { exercisesFactory } from "./exercises-factory";
import { workoutsFactory } from "./workouts-factory";

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
