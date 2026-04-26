import { generateId } from "@next-lift/utilities/generate-id";
import { defineFactory } from "@praha/drizzle-factory";
import { schema } from "../../database-schemas";
import { daysFactory } from "./days-factory";

export const exercisePlansFactory = defineFactory({
	schema,
	table: "exercisePlans",
	resolver: ({ sequence, use }) => ({
		id: generateId(),
		dayId: () =>
			use(daysFactory)
				.create()
				.then((d) => d.id),
		displayOrder: sequence,
		metaInfo: null,
	}),
});
