import { generateId } from "@next-lift/utilities/generate-id";
import { defineFactory } from "@praha/drizzle-factory";
import { schema } from "../../database-schemas";

export const workoutsFactory = defineFactory({
	schema,
	table: "workouts",
	resolver: () => ({
		id: generateId(),
		startedAt: new Date(),
	}),
});
