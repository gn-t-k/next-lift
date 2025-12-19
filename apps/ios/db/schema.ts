import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// 動作確認用の簡易スキーマ
// 本格的なスキーマはper-user-databaseパッケージで定義予定
export const testTable = sqliteTable("test", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	name: text("name").notNull(),
	createdAt: integer("created_at", { mode: "timestamp" })
		.notNull()
		.$defaultFn(() => new Date()),
});
