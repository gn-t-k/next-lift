import { defineFactory } from "@praha/drizzle-factory";
import { schema } from "../../database-schemas";
import { setPlansFactory } from "./set-plans-factory";

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
