import { defineFactory } from "@praha/drizzle-factory";
import { schema } from "../../database-schemas";

export const testTableFactory = defineFactory({
	schema,
	table: "testTable",
	resolver: ({ sequence }) => ({
		id: `test-${sequence}`,
		name: `Test Item ${sequence}`,
		createdAt: new Date(),
	}),
});
