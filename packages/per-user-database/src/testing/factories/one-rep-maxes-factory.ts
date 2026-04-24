import { defineFactory } from "@praha/drizzle-factory";
import { schema } from "../../database-schemas";
import { exercisesFactory } from "./exercises-factory";

export const oneRepMaxesFactory = defineFactory({
	schema,
	table: "oneRepMaxes",
	resolver: ({ sequence, use }) => ({
		id: `one-rep-max-${sequence}`,
		exerciseId: () =>
			use(exercisesFactory)
				.create()
				.then((e) => e.id),
		weightKg: 100,
		weightInputUnit: "kg",
		achievedAt: new Date(),
		registeredAt: new Date(),
	}),
});
