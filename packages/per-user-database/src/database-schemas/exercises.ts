import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const exercises = sqliteTable("exercises", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
});
