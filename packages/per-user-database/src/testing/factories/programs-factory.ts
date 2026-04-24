import { defineFactory } from "@praha/drizzle-factory";
import { schema } from "../../database-schemas";

export const programsFactory = defineFactory({
	schema,
	table: "programs",
	resolver: ({ sequence }) => ({
		id: `program-${sequence}`,
		name: `Program ${sequence}`,
		metaInfo: null,
	}),
});
