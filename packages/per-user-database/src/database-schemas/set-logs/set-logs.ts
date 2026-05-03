import { sql } from "drizzle-orm";
import {
	check,
	index,
	integer,
	real,
	sqliteTable,
	text,
} from "drizzle-orm/sqlite-core";
import { exerciseLogs } from "../exercise-logs/exercise-logs";

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
	(table) => [
		index("set_logs_exercise_log_id_idx").on(table.exerciseLogId),
		check("set_logs_weight_kg_check", sql`${table.weightKg} >= 0`),
		check("set_logs_reps_check", sql`${table.reps} >= 0`),
		check(
			"set_logs_rpe_check",
			sql`${table.rpe} IS NULL OR ${table.rpe} BETWEEN 1 AND 10`,
		),
		check(
			"set_logs_memo_length_check",
			sql`${table.memo} IS NULL OR length(${table.memo}) BETWEEN 1 AND 10000`,
		),
		check("set_logs_display_order_check", sql`${table.displayOrder} >= 0`),
	],
);
