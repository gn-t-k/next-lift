import { sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * default_weight_input_unit: "kg" | "lbs" （アプリ側定数で管理）。新規入力フォームの初期単位として使用（ADR-027）
 */
export const exercises = sqliteTable("exercises", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	defaultWeightInputUnit: text("default_weight_input_unit")
		.notNull()
		.default("kg"),
});
