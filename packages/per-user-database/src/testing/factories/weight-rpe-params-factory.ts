import { defineFactory } from "@praha/drizzle-factory";
import { schema } from "../../database-schemas";
import { setPlansFactory } from "./set-plans-factory";

export const weightRpeParamsFactory = defineFactory({
	schema,
	table: "weightRpeParams",
	resolver: ({ use }) => ({
		setPlanId: () =>
			use(setPlansFactory)
				.create()
				.then((sp) => sp.id),
		weightValue: 60,
		weightType: "kg",
		weightInputUnit: "kg",
		rpe: 8,
	}),
});
