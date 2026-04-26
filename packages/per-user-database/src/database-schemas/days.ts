import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { programs } from "./programs";

export const days = sqliteTable(
	"days",
	{
		id: text("id").primaryKey(),
		programId: text("program_id")
			.notNull()
			.references(() => programs.id),
		label: text("label").notNull(),
		displayOrder: integer("display_order").notNull(),
		// 自由記述テキスト。Day単位の補足等。構造化はアプリ側で行わない（ERD design-decisions #30）
		metaInfo: text("meta_info"),
	},
	(table) => [index("days_program_id_idx").on(table.programId)],
);
