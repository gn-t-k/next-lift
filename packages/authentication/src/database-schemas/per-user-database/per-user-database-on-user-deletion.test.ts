import { eq, sql } from "drizzle-orm";
import { beforeEach, describe, expect, test } from "vitest";
import { factories } from "../../testing/factories";
import { mockedAuthenticationDatabase } from "../../testing/mocked-authentication-database";
import { user } from "../user/user";
import { perUserDatabase } from "./per-user-database";

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
			// PRAGMA foreign_key_list は @tursodatabase/database が未対応のため sqlite_master の CREATE 文で検証する
			// drizzle sqlite-proxy 経由の raw .all() はカラム値の配列で返る（libsql のオブジェクト形式と異なる）
			const rows = await mockedAuthenticationDatabase.all<[string]>(
				sql`SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'per_user_database'`,
			);

			expect(rows).toHaveLength(1);
			expect(rows[0]?.[0]).not.toMatch(/REFERENCES\s+["`]?user["`]?/i);
		});
	});
});
