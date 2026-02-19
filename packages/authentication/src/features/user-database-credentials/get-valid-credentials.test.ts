import { mockIssueTokenOk } from "@next-lift/turso/testing";
import { R } from "@praha/byethrow";
import { beforeEach, describe, expect, test } from "vitest";
import { factories } from "../../testing/factories";
import { mockedAuthenticationDatabase } from "../../testing/setup";
import { UserDatabaseCredentialsNotFoundError } from "./get-user-database-credentials";
import { getValidCredentials } from "./get-valid-credentials";
import { saveUserDatabaseCredentials } from "./save-user-database-credentials";

describe("getValidCredentials", () => {
	describe("トークンが有効期限内の場合", () => {
		let testUserId: string;
		let issueTokenSpy: ReturnType<typeof mockIssueTokenOk>;

		beforeEach(async () => {
			issueTokenSpy = mockIssueTokenOk();

			const testUser = await factories(
				mockedAuthenticationDatabase,
			).users.create();
			testUserId = testUser.id;

			await saveUserDatabaseCredentials({
				userId: testUserId,
				dbName: "next-lift-test-user-db",
				url: "libsql://next-lift-test-user-db.turso.io",
				token: "valid-token",
				expiresAt: new Date("2026-12-31T00:00:00.000Z"),
			});
		});

		test("クレデンシャルをそのまま返すこと", async () => {
			const now = new Date("2026-03-01T00:00:00.000Z");
			const result = await getValidCredentials(testUserId, now);

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
		let testUserId: string;
		let issueTokenSpy: ReturnType<typeof mockIssueTokenOk>;

		beforeEach(async () => {
			issueTokenSpy = mockIssueTokenOk({
				jwt: "new-mock-jwt-token",
				expiresAt: new Date("2026-04-01T00:00:00.000Z"),
			});

			const testUser = await factories(
				mockedAuthenticationDatabase,
			).users.create();
			testUserId = testUser.id;

			await saveUserDatabaseCredentials({
				userId: testUserId,
				dbName: "next-lift-test-user-db",
				url: "libsql://next-lift-test-user-db.turso.io",
				token: "expired-token",
				expiresAt: new Date("2026-01-01T00:00:00.000Z"),
			});
		});

		test("新トークンを発行して返すこと", async () => {
			const now = new Date("2026-03-01T00:00:00.000Z");
			const result = await getValidCredentials(testUserId, now);

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
			await getValidCredentials(testUserId, now);

			expect(issueTokenSpy).toHaveBeenCalledWith({
				expiresInDays: 30,
				startingFrom: now,
				databaseName: "next-lift-test-user-db",
			});
		});
	});

	describe("クレデンシャルが存在しない場合", () => {
		test("UserDatabaseCredentialsNotFoundErrorを返すこと", async () => {
			const result = await getValidCredentials("non-existent-user");

			expect(R.isFailure(result)).toBe(true);
			if (!R.isFailure(result)) return;

			expect(result.error).toBeInstanceOf(UserDatabaseCredentialsNotFoundError);
		});
	});
});
