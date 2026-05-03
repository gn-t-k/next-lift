import { generateId } from "@next-lift/utilities/generate-id";
import { defineFactory } from "@praha/drizzle-factory";
import { exercisePlansFactory } from "../exercise-plans/exercise-plans-factory";
import { schema } from "../index";

export const setPlansFactory = defineFactory({
	schema,
	table: "setPlans",
	resolver: ({ sequence, use }) => ({
		id: generateId(),
		exercisePlanId: () =>
			use(exercisePlansFactory)
				.create()
				.then((ep) => ep.id),
		planType: "weight_reps",
		displayOrder: sequence,
		metaInfo: null,
	}),
});
