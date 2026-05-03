import { generateId } from "@next-lift/utilities/generate-id";
import { defineFactory } from "@praha/drizzle-factory";
import { daysFactory } from "../days/days-factory";
import { schema } from "../index";
import { workoutsFactory } from "../workouts/workouts-factory";

export const workoutDayLinksFactory = defineFactory({
	schema,
	table: "workoutDayLinks",
	resolver: ({ use }) => ({
		id: generateId(),
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
