import { R } from "@praha/byethrow";
import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, test } from "vitest";
import { perUserDatabase } from "../../database-schemas";
import { factories } from "../../testing/factories";
import { mockedAuthenticationDatabase } from "../../testing/setup";
import { deleteUserDatabaseCredentials } from "./delete-user-database-credentials";

describe("deleteUserDatabaseCredentials", () => {
	describe("レコードが存在するとき", () => {
		let testUserId: string;

		beforeEach(async () => {
			const record = await factories(
				mockedAuthenticationDatabase,
			).perUserDatabases.create();
			testUserId = record.userId;
		});

		test("レコードが削除されること", async () => {
			const result = await deleteUserDatabaseCredentials(testUserId);

			expect(R.isSuccess(result)).toBe(true);

			const records = await mockedAuthenticationDatabase
				.select()
				.from(perUserDatabase)
				.where(eq(perUserDatabase.userId, testUserId));

			expect(records).toEqual([]);
		});
	});

	describe("レコードが存在しないとき", () => {
		test("エラーにならないこと", async () => {
			const result = await deleteUserDatabaseCredentials("non-existent-user");

			expect(R.isSuccess(result)).toBe(true);
		});
	});
});
