import { sql } from "drizzle-orm";
import { check, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * default_weight_input_unit: "kg" | "lbs" （アプリ側定数で管理）。新規入力フォームの初期単位として使用（ADR-027）
 */
export const exercises = sqliteTable(
	"exercises",
	{
		id: text("id").primaryKey(),
		name: text("name").notNull(),
		defaultWeightInputUnit: text("default_weight_input_unit")
			.notNull()
			.default("kg"),
	},
	(table) => [
		check(
			"exercises_name_length_check",
			sql`length(${table.name}) BETWEEN 1 AND 200`,
		),
	],
);
