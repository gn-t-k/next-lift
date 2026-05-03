import { generateId } from "@next-lift/utilities/generate-id";
import { defineFactory } from "@praha/drizzle-factory";
import { exercisesFactory } from "../exercises/exercises-factory";
import { schema } from "../index";

export const oneRepMaxesFactory = defineFactory({
	schema,
	table: "oneRepMaxes",
	resolver: ({ use }) => ({
		id: generateId(),
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
