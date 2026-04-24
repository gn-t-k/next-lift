import { defineFactory } from "@praha/drizzle-factory";
import { schema } from "../../database-schemas";
import { workoutsFactory } from "./workouts-factory";

export const workoutCompletionsFactory = defineFactory({
	schema,
	table: "workoutCompletions",
	resolver: ({ sequence, use }) => ({
		id: `workout-completion-${sequence}`,
		workoutId: () =>
			use(workoutsFactory)
				.create()
				.then((w) => w.id),
		completedAt: new Date(),
	}),
});
