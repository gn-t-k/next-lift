import { defineFactory } from "@praha/drizzle-factory";
import { schema } from "../../database-schemas";
import { exercisePlansFactory } from "./exercise-plans-factory";

export const setPlansFactory = defineFactory({
	schema,
	table: "setPlans",
	resolver: ({ sequence, use }) => ({
		id: `set-plan-${sequence}`,
		exercisePlanId: () =>
			use(exercisePlansFactory)
				.create()
				.then((ep) => ep.id),
		planType: "weight_reps",
		displayOrder: sequence,
		metaInfo: null,
	}),
});
