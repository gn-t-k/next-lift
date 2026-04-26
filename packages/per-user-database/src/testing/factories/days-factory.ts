import { generateId } from "@next-lift/utilities/generate-id";
import { defineFactory } from "@praha/drizzle-factory";
import { schema } from "../../database-schemas";
import { programsFactory } from "./programs-factory";

export const daysFactory = defineFactory({
	schema,
	table: "days",
	resolver: ({ sequence, use }) => ({
		id: generateId(),
		programId: () =>
			use(programsFactory)
				.create()
				.then((p) => p.id),
		label: `Day ${sequence}`,
		displayOrder: sequence,
		metaInfo: null,
	}),
});
