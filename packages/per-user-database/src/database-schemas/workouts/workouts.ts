import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const workouts = sqliteTable("workouts", {
	id: text("id").primaryKey(),
	startedAt: integer("started_at", { mode: "timestamp_ms" }).notNull(),
});
