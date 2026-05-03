import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * Per-User Database情報を管理する状態テーブル
 * - 外部キー制約なし（ADR-019: アカウント削除時にPer-User DB保持）
 * - Tokenは暗号化して保存（ADR-020）
 */
export const perUserDatabase = sqliteTable("per_user_database", {
	id: text("id").primaryKey(),
	userId: text("user_id").notNull().unique(),
	databaseName: text("database_name").notNull(),
	databaseUrl: text("database_url").notNull(),
	encryptedToken: text("encrypted_token").notNull(),
	tokenExpiresAt: integer("token_expires_at", {
		mode: "timestamp_ms",
	}).notNull(),
	createdAt: integer("created_at", { mode: "timestamp_ms" })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp_ms" })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.notNull(),
});
