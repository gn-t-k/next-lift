import { sql } from "drizzle-orm";
import { check, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const programs = sqliteTable(
	"programs",
	{
		id: text("id").primaryKey(),
		name: text("name").notNull(),
		// 自由記述テキスト。漸進ルール等の構造化はアプリ側で行わない（ERD design-decisions #30）
		metaInfo: text("meta_info"),
	},
	(table) => [
		check(
			"programs_name_length_check",
			sql`length(${table.name}) BETWEEN 1 AND 200`,
		),
		check(
			"programs_meta_info_length_check",
			sql`${table.metaInfo} IS NULL OR length(${table.metaInfo}) BETWEEN 1 AND 10000`,
		),
	],
);
