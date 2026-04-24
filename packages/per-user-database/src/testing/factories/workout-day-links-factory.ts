import { defineFactory } from "@praha/drizzle-factory";
import { schema } from "../../database-schemas";
import { daysFactory } from "./days-factory";
import { workoutsFactory } from "./workouts-factory";

export const workoutDayLinksFactory = defineFactory({
	schema,
	table: "workoutDayLinks",
	resolver: ({ sequence, use }) => ({
		id: `workout-day-link-${sequence}`,
		workoutId: () =>
			use(workoutsFactory)
				.create()
				.then((w) => w.id),
		dayId: () =>
			use(daysFactory)
				.create()
				.then((d) => d.id),
	}),
});
