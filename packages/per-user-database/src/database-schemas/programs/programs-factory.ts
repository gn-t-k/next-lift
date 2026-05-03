import { generateId } from "@next-lift/utilities/generate-id";
import { defineFactory } from "@praha/drizzle-factory";
import { schema } from "../index";

export const programsFactory = defineFactory({
	schema,
	table: "programs",
	resolver: ({ sequence }) => ({
		id: generateId(),
		name: `Program ${sequence}`,
		metaInfo: null,
	}),
});
