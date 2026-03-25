import { mockPrivateEnv } from "@next-lift/env/testing";
import { mockIssueTokenOk } from "@next-lift/turso/testing";
import { R } from "@praha/byethrow";
import { mockContext } from "@praha/diva/test";
import { beforeEach, describe, expect, test } from "vitest";
import { withDatabase } from "../../../helpers/database-context";
import { mockedAuthenticationDatabase } from "../../../testing/mocked-authentication-database";
import { encrypt, getEncryptionKey } from "../helpers/crypto";
import { CredentialsNotFoundError } from "../helpers/find-credentials";
import { upsertCredentials } from "../helpers/upsert-credentials";
import { resolveValidCredentials } from "./resolve-valid-credentials";

mockPrivateEnv({ TURSO_TOKEN_ENCRYPTION_KEY: "0".repeat(64) });
mockContext(withDatabase, () => mockedAuthenticationDatabase);

describe("resolveValidCredentials", () => {
	describe("トークンが有効期限内の場合", () => {
		const testUserId = "test-user-id";
		let issueTokenSpy: ReturnType<typeof mockIssueTokenOk>;

		beforeEach(async () => {
			issueTokenSpy = mockIssueTokenOk();

			await upsertCredentials({
				userId: testUserId,
				dbName: "next-lift-test-user-db",
				url: "libsql://next-lift-test-user-db.turso.io",
				encryptedToken: encrypt("valid-token", getEncryptionKey()),
				expiresAt: new Date("2026-12-31T00:00:00.000Z"),
			});
		});

		test("クレデンシャルをそのまま返すこと", async () => {
			const now = new Date("2026-03-01T00:00:00.000Z");
			const result = await resolveValidCredentials(testUserId, now);

			expect(R.isSuccess(result)).toBe(true);
			if (!R.isSuccess(result)) return;

			expect(result.value).toEqual({
				dbName: "next-lift-test-user-db",
				url: "libsql://next-lift-test-user-db.turso.io",
				token: "valid-token",
				expiresAt: new Date("2026-12-31T00:00:00.000Z"),
			});

			expect(issueTokenSpy).not.toHaveBeenCalled();
		});
	});

	describe("トークンが期限切れの場合", () => {
		const testUserId = "test-user-id";
		let issueTokenSpy: ReturnType<typeof mockIssueTokenOk>;

		beforeEach(async () => {
			issueTokenSpy = mockIssueTokenOk({
				jwt: "new-mock-jwt-token",
				expiresAt: new Date("2026-04-01T00:00:00.000Z"),
			});

			await upsertCredentials({
				userId: testUserId,
				dbName: "next-lift-test-user-db",
				url: "libsql://next-lift-test-user-db.turso.io",
				encryptedToken: encrypt("expired-token", getEncryptionKey()),
				expiresAt: new Date("2026-01-01T00:00:00.000Z"),
			});
		});

		test("新トークンを発行して返すこと", async () => {
			const now = new Date("2026-03-01T00:00:00.000Z");
			const result = await resolveValidCredentials(testUserId, now);

			expect(R.isSuccess(result)).toBe(true);
			if (!R.isSuccess(result)) return;

			expect(result.value).toEqual({
				dbName: "next-lift-test-user-db",
				url: "libsql://next-lift-test-user-db.turso.io",
				token: "new-mock-jwt-token",
				expiresAt: new Date("2026-04-01T00:00:00.000Z"),
			});
		});

		test("issueTokenが正しいパラメータで呼ばれること", async () => {
			const now = new Date("2026-03-01T00:00:00.000Z");
			await resolveValidCredentials(testUserId, now);

			expect(issueTokenSpy).toHaveBeenCalledWith({
				expiresInDays: 30,
				startingFrom: now,
				databaseName: "next-lift-test-user-db",
			});
		});
	});

	describe("クレデンシャルが存在しない場合", () => {
		test("CredentialsNotFoundErrorを返すこと", async () => {
			const result = await resolveValidCredentials(
				"non-existent-user",
				new Date(),
			);

			expect(R.isFailure(result)).toBe(true);
			if (!R.isFailure(result)) return;

			expect(result.error).toBeInstanceOf(CredentialsNotFoundError);
		});
	});
});
