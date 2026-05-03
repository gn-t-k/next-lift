import { defineFactory } from "@praha/drizzle-factory";
import { schema } from "../index";
import { setPlansFactory } from "../set-plans/set-plans-factory";

export const repsRpeParamsFactory = defineFactory({
	schema,
	table: "repsRpeParams",
	resolver: ({ use }) => ({
		setPlanId: () =>
			use(setPlansFactory)
				.create()
				.then((sp) => sp.id),
		reps: 10,
		rpe: 8,
	}),
});
