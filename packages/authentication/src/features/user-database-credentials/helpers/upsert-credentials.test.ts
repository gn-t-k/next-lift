import { mockPrivateEnv } from "@next-lift/env/testing";
import { R } from "@praha/byethrow";
import { mockContext } from "@praha/diva/test";
import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, test } from "vitest";
import { perUserDatabase } from "../../../database-schemas";
import { withDatabase } from "../../../helpers/database-context";
import { mockedAuthenticationDatabase } from "../../../testing/mocked-authentication-database";
import { upsertCredentials } from "./upsert-credentials";

mockPrivateEnv({ TURSO_TOKEN_ENCRYPTION_KEY: "0".repeat(64) });
mockContext(withDatabase, () => mockedAuthenticationDatabase);

describe("upsertCredentials", () => {
	describe("レコードが存在しないとき", () => {
		const testUserId = "test-user-id";

		test("新規レコードが保存されること", async () => {
			const result = await upsertCredentials({
				userId: testUserId,
				dbName: "next-lift-test-user-db",
				url: "libsql://next-lift-test-user-db.turso.io",
				encryptedToken: "already-encrypted-token",
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
					encryptedToken: "already-encrypted-token",
					tokenExpiresAt: new Date("2025-12-31T00:00:00.000Z"),
				}),
			]);
		});
	});

	describe("同一userIdのレコードが既に存在するとき", () => {
		const testUserId = "test-user-id";

		beforeEach(async () => {
			await upsertCredentials({
				userId: testUserId,
				dbName: "old-db-name",
				url: "libsql://old-db.turso.io",
				encryptedToken: "old-encrypted-token",
				expiresAt: new Date("2025-06-01T00:00:00.000Z"),
			});
		});

		test("レコードが更新（UPSERT）されること", async () => {
			const result = await upsertCredentials({
				userId: testUserId,
				dbName: "new-db-name",
				url: "libsql://new-db.turso.io",
				encryptedToken: "new-encrypted-token",
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
					encryptedToken: "new-encrypted-token",
					tokenExpiresAt: new Date("2025-12-31T00:00:00.000Z"),
				}),
			]);
		});
	});
});
