import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { days } from "./days";

export const exercisePlans = sqliteTable(
	"exercise_plans",
	{
		id: text("id").primaryKey(),
		dayId: text("day_id")
			.notNull()
			.references(() => days.id),
		displayOrder: integer("display_order").notNull(),
		// 自由記述テキスト。プレースホルダー枠の説明等。構造化はアプリ側で行わない（ERD design-decisions #30）
		metaInfo: text("meta_info"),
	},
	(table) => [index("exercise_plans_day_id_idx").on(table.dayId)],
);
