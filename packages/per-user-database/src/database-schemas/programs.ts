import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const programs = sqliteTable("programs", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	metaInfo: text("meta_info"),
});
