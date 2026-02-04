import { composeFactory } from "@praha/drizzle-factory";
import { testTableFactory } from "./test-table-factory";

export const factories = composeFactory({
	testItems: testTableFactory,
});
