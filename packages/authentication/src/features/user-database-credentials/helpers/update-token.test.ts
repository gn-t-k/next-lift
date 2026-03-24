import { mockPrivateEnv } from "@next-lift/env/testing";
import { R } from "@praha/byethrow";
import { mockContext } from "@praha/diva/test";
import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, test } from "vitest";
import { perUserDatabase } from "../../../database-schemas";
import { withDatabase } from "../../../helpers/database-context";
import { mockedAuthenticationDatabase } from "../../../testing/mocked-authentication-database";
import { UpdateTokenError, updateToken } from "./update-token";
import { upsertCredentials } from "./upsert-credentials";

mockPrivateEnv({ TURSO_TOKEN_ENCRYPTION_KEY: "0".repeat(64) });
mockContext(withDatabase, () => mockedAuthenticationDatabase);

describe("updateToken", () => {
	describe("レコードが存在するとき", () => {
		const testUserId = "test-user-id";

		beforeEach(async () => {
			await upsertCredentials({
				userId: testUserId,
				dbName: "next-lift-test-user-db",
				url: "libsql://next-lift-test-user-db.turso.io",
				encryptedToken: "old-encrypted-token",
				expiresAt: new Date("2025-06-01T00:00:00.000Z"),
			});
		});

		test("トークンと有効期限が更新されること", async () => {
			const result = await updateToken({
				userId: testUserId,
				encryptedToken: "new-encrypted-token",
				expiresAt: new Date("2025-12-31T00:00:00.000Z"),
			});

			expect(R.isSuccess(result)).toBe(true);

			const records = await mockedAuthenticationDatabase
				.select({
					encryptedToken: perUserDatabase.encryptedToken,
					tokenExpiresAt: perUserDatabase.tokenExpiresAt,
				})
				.from(perUserDatabase)
				.where(eq(perUserDatabase.userId, testUserId));

			expect(records).toEqual([
				{
					encryptedToken: "new-encrypted-token",
					tokenExpiresAt: new Date("2025-12-31T00:00:00.000Z"),
				},
			]);
		});

		test("DB名やURLは変更されないこと", async () => {
			await updateToken({
				userId: testUserId,
				encryptedToken: "new-encrypted-token",
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
	});

	describe("レコードが存在しないとき", () => {
		test("UpdateTokenErrorが返ること", async () => {
			const result = await updateToken({
				userId: "non-existent-user",
				encryptedToken: "token",
				expiresAt: new Date("2025-12-31T00:00:00.000Z"),
			});

			expect(R.isFailure(result)).toBe(true);
			if (!R.isFailure(result)) return;

			expect(result.error).toBeInstanceOf(UpdateTokenError);
		});
	});
});
