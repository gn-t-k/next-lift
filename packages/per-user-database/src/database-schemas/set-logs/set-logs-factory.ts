import { generateId } from "@next-lift/utilities/generate-id";
import { defineFactory } from "@praha/drizzle-factory";
import { exerciseLogsFactory } from "../exercise-logs/exercise-logs-factory";
import { schema } from "../index";

export const setLogsFactory = defineFactory({
	schema,
	table: "setLogs",
	resolver: ({ sequence, use }) => ({
		id: generateId(),
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
