import { R } from "@praha/byethrow";
import { beforeEach, describe, expect, test } from "vitest";
import { factories } from "../../testing/factories";
import { mockedAuthenticationDatabase } from "../../testing/setup";
import {
	getUserDatabaseCredentials,
	UserDatabaseCredentialsNotFoundError,
} from "./get-user-database-credentials";
import { saveUserDatabaseCredentials } from "./save-user-database-credentials";

describe("getUserDatabaseCredentials", () => {
	describe("レコードが存在するとき", () => {
		const rawToken = "test-auth-token-plaintext";
		let testUserId: string;

		beforeEach(async () => {
			const testUser = await factories(
				mockedAuthenticationDatabase,
			).users.create();
			testUserId = testUser.id;

			await saveUserDatabaseCredentials({
				userId: testUserId,
				dbName: "next-lift-test-user-db",
				url: "libsql://next-lift-test-user-db.turso.io",
				token: rawToken,
				expiresAt: new Date("2025-12-31T00:00:00.000Z"),
			});
		});

		test("復号化されたトークンを含む情報が取得できること", async () => {
			const result = await getUserDatabaseCredentials(testUserId);

			expect(R.isSuccess(result)).toBe(true);
			if (!R.isSuccess(result)) return;

			expect(result.value).toEqual({
				dbName: "next-lift-test-user-db",
				url: "libsql://next-lift-test-user-db.turso.io",
				token: rawToken,
				expiresAt: new Date("2025-12-31T00:00:00.000Z"),
			});
		});
	});

	describe("レコードが存在しないとき", () => {
		test("UserDatabaseCredentialsNotFoundErrorが返ること", async () => {
			const result = await getUserDatabaseCredentials("non-existent-user");

			expect(R.isFailure(result)).toBe(true);
			if (!R.isFailure(result)) return;

			expect(result.error).toBeInstanceOf(UserDatabaseCredentialsNotFoundError);
		});
	});
});
