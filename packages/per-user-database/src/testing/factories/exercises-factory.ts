import { defineFactory } from "@praha/drizzle-factory";
import { schema } from "../../database-schemas";

export const exercisesFactory = defineFactory({
	schema,
	table: "exercises",
	resolver: ({ sequence }) => ({
		id: `exercise-${sequence}`,
		name: `Exercise ${sequence}`,
	}),
});
