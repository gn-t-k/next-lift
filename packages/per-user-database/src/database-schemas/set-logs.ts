import {
	index,
	integer,
	real,
	sqliteTable,
	text,
} from "drizzle-orm/sqlite-core";
import { exerciseLogs } from "./exercise-logs";

/**
 * weight_kg は常にkg単位。lbs入力時もkgに変換して格納。
 * weight_input_unit: "kg" | "lbs" （アプリ側定数で管理）
 */
export const setLogs = sqliteTable(
	"set_logs",
	{
		id: text("id").primaryKey(),
		exerciseLogId: text("exercise_log_id")
			.notNull()
			.references(() => exerciseLogs.id),
		weightKg: real("weight_kg").notNull(),
		weightInputUnit: text("weight_input_unit").notNull(),
		reps: integer("reps").notNull(),
		rpe: real("rpe"),
		memo: text("memo"),
		displayOrder: integer("display_order").notNull(),
	},
	(table) => [index("set_logs_exercise_log_id_idx").on(table.exerciseLogId)],
);
