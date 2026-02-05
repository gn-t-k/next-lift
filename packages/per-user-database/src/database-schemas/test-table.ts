import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * 動作確認用の仮スキーマ
 * 本格的なスキーマ設計はフェーズ2で実施
 */
export const testTable = sqliteTable("test", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});
