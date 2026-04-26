import { generateId } from "@next-lift/utilities/generate-id";
import { defineFactory } from "@praha/drizzle-factory";
import { schema } from "../../database-schemas";
import { workoutsFactory } from "./workouts-factory";

export const workoutCompletionsFactory = defineFactory({
	schema,
	table: "workoutCompletions",
	resolver: ({ use }) => ({
		id: generateId(),
		workoutId: () =>
			use(workoutsFactory)
				.create()
				.then((w) => w.id),
		completedAt: new Date(),
	}),
});
