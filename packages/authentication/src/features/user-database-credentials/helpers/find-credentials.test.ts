import { mockPrivateEnv } from "@next-lift/env/testing";
import { R } from "@praha/byethrow";
import { mockContext } from "@praha/diva/test";
import { beforeEach, describe, expect, test } from "vitest";
import { withDatabase } from "../../../helpers/database-context";
import { mockedAuthenticationDatabase } from "../../../testing/mocked-authentication-database";
import { CredentialsNotFoundError, findCredentials } from "./find-credentials";
import { upsertCredentials } from "./upsert-credentials";

mockPrivateEnv({ TURSO_TOKEN_ENCRYPTION_KEY: "0".repeat(64) });
mockContext(withDatabase, () => mockedAuthenticationDatabase);

describe("findCredentials", () => {
	describe("レコードが存在するとき", () => {
		const testUserId = "test-user-id";

		beforeEach(async () => {
			await upsertCredentials({
				userId: testUserId,
				dbName: "next-lift-test-user-db",
				url: "libsql://next-lift-test-user-db.turso.io",
				encryptedToken: "raw-encrypted-token",
				expiresAt: new Date("2025-12-31T00:00:00.000Z"),
			});
		});

		test("DBの生データが返ること", async () => {
			const result = await findCredentials(testUserId);

			expect(R.isSuccess(result)).toBe(true);
			if (!R.isSuccess(result)) return;

			expect(result.value).toEqual({
				dbName: "next-lift-test-user-db",
				url: "libsql://next-lift-test-user-db.turso.io",
				encryptedToken: "raw-encrypted-token",
				expiresAt: new Date("2025-12-31T00:00:00.000Z"),
			});
		});
	});

	describe("レコードが存在しないとき", () => {
		test("CredentialsNotFoundErrorが返ること", async () => {
			const result = await findCredentials("non-existent-user");

			expect(R.isFailure(result)).toBe(true);
			if (!R.isFailure(result)) return;

			expect(result.error).toBeInstanceOf(CredentialsNotFoundError);
		});
	});
});
