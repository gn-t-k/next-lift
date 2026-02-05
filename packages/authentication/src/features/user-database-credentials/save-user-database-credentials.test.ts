import { R } from "@praha/byethrow";
import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, test } from "vitest";
import { perUserDatabase } from "../../database-schemas";
import { factories } from "../../testing/factories";
import { mockedAuthenticationDatabase } from "../../testing/setup";
import { saveUserDatabaseCredentials } from "./save-user-database-credentials";

describe("saveUserDatabaseCredentials", () => {
	const rawToken = "test-auth-token-plaintext";

	describe("レコードが存在しないとき", () => {
		let testUserId: string;

		beforeEach(async () => {
			const testUser = await factories(
				mockedAuthenticationDatabase,
			).users.create();
			testUserId = testUser.id;
		});

		test("新規レコードが保存されること", async () => {
			const result = await saveUserDatabaseCredentials({
				userId: testUserId,
				dbName: "next-lift-test-user-db",
				url: "libsql://next-lift-test-user-db.turso.io",
				token: rawToken,
				expiresAt: new Date("2025-12-31T00:00:00.000Z"),
			});

			expect(R.isSuccess(result)).toBe(true);

			const records = await mockedAuthenticationDatabase
				.select()
				.from(perUserDatabase)
				.where(eq(perUserDatabase.userId, testUserId));

			expect(records).toEqual([
				expect.objectContaining({
					userId: testUserId,
					databaseName: "next-lift-test-user-db",
					databaseUrl: "libsql://next-lift-test-user-db.turso.io",
					tokenExpiresAt: new Date("2025-12-31T00:00:00.000Z"),
				}),
			]);
		});

		test("トークンが暗号化されてDBに保存されていること", async () => {
			await saveUserDatabaseCredentials({
				userId: testUserId,
				dbName: "next-lift-test-user-db",
				url: "libsql://next-lift-test-user-db.turso.io",
				token: rawToken,
				expiresAt: new Date("2025-12-31T00:00:00.000Z"),
			});

			const records = await mockedAuthenticationDatabase
				.select({
					encryptedToken: perUserDatabase.encryptedToken,
				})
				.from(perUserDatabase)
				.where(eq(perUserDatabase.userId, testUserId));

			expect(records).toEqual([
				{
					encryptedToken: expect.not.stringContaining(rawToken),
				},
			]);
		});
	});

	describe("同一userIdのレコードが既に存在するとき", () => {
		let testUserId: string;

		beforeEach(async () => {
			const testUser = await factories(
				mockedAuthenticationDatabase,
			).users.create();
			testUserId = testUser.id;

			await saveUserDatabaseCredentials({
				userId: testUserId,
				dbName: "old-db-name",
				url: "libsql://old-db.turso.io",
				token: "old-token",
				expiresAt: new Date("2025-06-01T00:00:00.000Z"),
			});
		});

		test("レコードが更新（UPSERT）されること", async () => {
			const result = await saveUserDatabaseCredentials({
				userId: testUserId,
				dbName: "new-db-name",
				url: "libsql://new-db.turso.io",
				token: "new-token",
				expiresAt: new Date("2025-12-31T00:00:00.000Z"),
			});

			expect(R.isSuccess(result)).toBe(true);

			const records = await mockedAuthenticationDatabase
				.select()
				.from(perUserDatabase)
				.where(eq(perUserDatabase.userId, testUserId));

			expect(records).toEqual([
				expect.objectContaining({
					userId: testUserId,
					databaseName: "new-db-name",
					databaseUrl: "libsql://new-db.turso.io",
					tokenExpiresAt: new Date("2025-12-31T00:00:00.000Z"),
				}),
			]);
		});
	});
});
