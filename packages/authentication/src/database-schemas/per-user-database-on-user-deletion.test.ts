import { eq, sql } from "drizzle-orm";
import { beforeEach, describe, expect, test } from "vitest";
import { factories } from "../testing/factories";
import { mockedAuthenticationDatabase } from "../testing/setup";
import { perUserDatabase } from "./per-user-database";
import { user } from "./user";

describe("per_user_databaseテーブル - ユーザー削除時の挙動", () => {
	describe("userレコードを削除したとき", () => {
		let testUserId: string;

		beforeEach(async () => {
			const record = await factories(
				mockedAuthenticationDatabase,
			).perUserDatabases.create();
			testUserId = record.userId;

			await mockedAuthenticationDatabase
				.delete(user)
				.where(eq(user.id, testUserId));
		});

		test("per_user_databaseレコードが残存すること", async () => {
			const records = await mockedAuthenticationDatabase
				.select()
				.from(perUserDatabase)
				.where(eq(perUserDatabase.userId, testUserId));

			expect(records).toHaveLength(1);
			expect(records[0]?.userId).toBe(testUserId);
		});

		test("userレコードが削除されていること", async () => {
			const records = await mockedAuthenticationDatabase
				.select()
				.from(user)
				.where(eq(user.id, testUserId));

			expect(records).toHaveLength(0);
		});
	});

	describe("per_user_databaseテーブルのスキーマ", () => {
		test("user_idカラムに外部キー制約がないこと", async () => {
			const foreignKeys = await mockedAuthenticationDatabase.all<{
				table: string;
				from: string;
				to: string;
			}>(sql`PRAGMA foreign_key_list('per_user_database')`);

			const userForeignKey = foreignKeys.find(
				(fk) => fk.from === "user_id" && fk.table === "user",
			);

			expect(userForeignKey).toBeUndefined();
		});
	});
});
