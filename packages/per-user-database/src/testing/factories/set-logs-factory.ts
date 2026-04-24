import { defineFactory } from "@praha/drizzle-factory";
import { schema } from "../../database-schemas";
import { exerciseLogsFactory } from "./exercise-logs-factory";

export const setLogsFactory = defineFactory({
	schema,
	table: "setLogs",
	resolver: ({ sequence, use }) => ({
		id: `set-log-${sequence}`,
		exerciseLogId: () =>
			use(exerciseLogsFactory)
				.create()
				.then((el) => el.id),
		weightKg: 60,
		weightInputUnit: "kg",
		reps: 10,
		rpe: null,
		memo: null,
		displayOrder: sequence,
	}),
});
