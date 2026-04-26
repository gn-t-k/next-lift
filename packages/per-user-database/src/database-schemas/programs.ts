import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const programs = sqliteTable("programs", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	// 自由記述テキスト。漸進ルール等の構造化はアプリ側で行わない（ERD design-decisions #30）
	metaInfo: text("meta_info"),
});
