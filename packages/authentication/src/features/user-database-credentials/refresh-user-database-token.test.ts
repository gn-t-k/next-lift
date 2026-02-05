import { R } from "@praha/byethrow";
import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, test } from "vitest";
import { perUserDatabase } from "../../database-schemas";
import { factories } from "../../testing/factories";
import { mockedAuthenticationDatabase } from "../../testing/setup";
import { getUserDatabaseCredentials } from "./get-user-database-credentials";
import {
	RefreshUserDatabaseTokenError,
	refreshUserDatabaseToken,
} from "./refresh-user-database-token";
import { saveUserDatabaseCredentials } from "./save-user-database-credentials";

describe("refreshUserDatabaseToken", () => {
	describe("レコードが存在するとき", () => {
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
				token: "old-token",
				expiresAt: new Date("2025-06-01T00:00:00.000Z"),
			});
		});

		test("トークンと有効期限が更新されること", async () => {
			const newToken = "new-token-plaintext";
			const newExpiresAt = new Date("2025-12-31T00:00:00.000Z");

			const result = await refreshUserDatabaseToken({
				userId: testUserId,
				token: newToken,
				expiresAt: newExpiresAt,
			});

			expect(R.isSuccess(result)).toBe(true);

			// トークンが新しい値で暗号化されて保存されていること
			const records = await mockedAuthenticationDatabase
				.select({
					encryptedToken: perUserDatabase.encryptedToken,
					tokenExpiresAt: perUserDatabase.tokenExpiresAt,
				})
				.from(perUserDatabase)
				.where(eq(perUserDatabase.userId, testUserId));

			expect(records).toEqual([
				{
					encryptedToken: expect.not.stringContaining(newToken),
					tokenExpiresAt: newExpiresAt,
				},
			]);
		});

		test("DB名やURLは変更されないこと", async () => {
			await refreshUserDatabaseToken({
				userId: testUserId,
				token: "new-token",
				expiresAt: new Date("2025-12-31T00:00:00.000Z"),
			});

			const records = await mockedAuthenticationDatabase
				.select({
					databaseName: perUserDatabase.databaseName,
					databaseUrl: perUserDatabase.databaseUrl,
				})
				.from(perUserDatabase)
				.where(eq(perUserDatabase.userId, testUserId));

			expect(records).toEqual([
				{
					databaseName: "next-lift-test-user-db",
					databaseUrl: "libsql://next-lift-test-user-db.turso.io",
				},
			]);
		});

		test("復号化して取得できること", async () => {
			const newToken = "new-token-plaintext";

			await refreshUserDatabaseToken({
				userId: testUserId,
				token: newToken,
				expiresAt: new Date("2025-12-31T00:00:00.000Z"),
			});

			const result = await getUserDatabaseCredentials(testUserId);

			expect(R.isSuccess(result)).toBe(true);
			if (!R.isSuccess(result)) return;

			expect(result.value.token).toBe(newToken);
		});
	});

	describe("レコードが存在しないとき", () => {
		test("RefreshUserDatabaseTokenErrorが返ること", async () => {
			const result = await refreshUserDatabaseToken({
				userId: "non-existent-user",
				token: "token",
				expiresAt: new Date("2025-12-31T00:00:00.000Z"),
			});

			expect(R.isFailure(result)).toBe(true);
			if (!R.isFailure(result)) return;

			expect(result.error).toBeInstanceOf(RefreshUserDatabaseTokenError);
		});
	});
});
