import { generateId } from "@next-lift/utilities/generate-id";
import { defineFactory } from "@praha/drizzle-factory";
import { schema } from "../../database-schemas";

export const exercisesFactory = defineFactory({
	schema,
	table: "exercises",
	resolver: ({ sequence }) => ({
		id: generateId(),
		name: `Exercise ${sequence}`,
	}),
});
