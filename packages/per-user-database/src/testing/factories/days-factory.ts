import { defineFactory } from "@praha/drizzle-factory";
import { schema } from "../../database-schemas";
import { programsFactory } from "./programs-factory";

export const daysFactory = defineFactory({
	schema,
	table: "days",
	resolver: ({ sequence, use }) => ({
		id: `day-${sequence}`,
		programId: () =>
			use(programsFactory)
				.create()
				.then((p) => p.id),
		label: `Day ${sequence}`,
		displayOrder: sequence,
		metaInfo: null,
	}),
});
