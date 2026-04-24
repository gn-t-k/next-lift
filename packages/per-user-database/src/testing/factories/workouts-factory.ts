import { defineFactory } from "@praha/drizzle-factory";
import { schema } from "../../database-schemas";

export const workoutsFactory = defineFactory({
	schema,
	table: "workouts",
	resolver: ({ sequence }) => ({
		id: `workout-${sequence}`,
		startedAt: new Date(),
	}),
});
