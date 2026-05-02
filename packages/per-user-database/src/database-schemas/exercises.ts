import { sql } from "drizzle-orm";
import { check, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * default_weight_input_unit: "kg" | "lbs" （アプリ側定数で管理）。新規入力フォームの初期単位として使用（ADR-027）
 * weight_step: 重量微調整UIの刻み量（kg基準）。バーベル系=2.5kg / ダンベル系=1kg or 0.5kg / ケトルベル=4kg と種目ごとに異なる（ER設計判断 #33）
 */
export const exercises = sqliteTable(
	"exercises",
	{
		id: text("id").primaryKey(),
		name: text("name").notNull(),
		defaultWeightInputUnit: text("default_weight_input_unit")
			.notNull()
			.default("kg"),
		weightStep: real("weight_step").notNull().default(2.5),
	},
	(table) => [
		check(
			"exercises_name_length_check",
			sql`length(${table.name}) BETWEEN 1 AND 200`,
		),
		check("exercises_weight_step_check", sql`${table.weightStep} > 0`),
	],
);
