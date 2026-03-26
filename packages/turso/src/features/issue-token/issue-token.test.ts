import { mockPrivateEnv } from "@next-lift/env/testing";
import { R } from "@praha/byethrow";
import { beforeEach, describe, expect, test } from "vitest";
import {
	mockFetch,
	mockFetchIssueTokenOk,
	mockFetchNetworkError,
	mockFetchServerError,
} from "../../helpers/fetch-context.mock";
import { IssueTokenError, issueToken } from "./issue-token";

mockPrivateEnv({
	TURSO_PLATFORM_API_TOKEN: "test-api-token",
	TURSO_ORGANIZATION: "test-org",
});

describe("issueToken", () => {
	describe("有効期限付きトークン", () => {
		const NOW = new Date("2025-01-01T00:00:00.000Z");

		beforeEach(() => {
			mockFetchIssueTokenOk({ jwt: "test-jwt-token" });
		});

		test("正しいURLでPOSTリクエストが送信されること", async () => {
			await issueToken({
				databaseName: "test-db",
				expiresInDays: 30,
				startingFrom: NOW,
			});

			expect(mockFetch).toHaveBeenCalledWith(
				"https://api.turso.tech/v1/organizations/test-org/databases/test-db/auth/tokens?expiration=30d",
				{
					method: "POST",
					headers: {
						Authorization: "Bearer test-api-token",
					},
				},
			);
		});

		test("JWTと有効期限が返されること", async () => {
			const result = await issueToken({
				databaseName: "test-db",
				expiresInDays: 30,
				startingFrom: NOW,
			});

			expect(R.isSuccess(result)).toBe(true);
			if (R.isSuccess(result)) {
				expect(result.value.jwt).toBe("test-jwt-token");
				expect(result.value.expiresAt).toEqual(
					new Date("2025-01-31T00:00:00.000Z"),
				);
			}
		});
	});

	describe("無期限トークン", () => {
		beforeEach(() => {
			mockFetchIssueTokenOk({ jwt: "permanent-jwt-token" });
		});

		test("正しいURLとボディでPOSTリクエストが送信されること", async () => {
			await issueToken({
				databaseName: "test-db",
				expiresInDays: null,
			});

			expect(mockFetch).toHaveBeenCalledWith(
				"https://api.turso.tech/v1/organizations/test-org/databases/test-db/auth/tokens",
				{
					method: "POST",
					headers: {
						Authorization: "Bearer test-api-token",
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						expiration: "never",
						authorization: "full-access",
					}),
				},
			);
		});

		test("JWTとnullの有効期限が返されること", async () => {
			const result = await issueToken({
				databaseName: "test-db",
				expiresInDays: null,
			});

			expect(R.isSuccess(result)).toBe(true);
			if (R.isSuccess(result)) {
				expect(result.value.jwt).toBe("permanent-jwt-token");
				expect(result.value.expiresAt).toBeNull();
			}
		});
	});

	describe("エラーの場合", () => {
		beforeEach(() => {
			mockFetchServerError();
		});

		test("IssueTokenErrorが返されること", async () => {
			const result = await issueToken({
				databaseName: "test-db",
				expiresInDays: null,
			});

			expect(R.isFailure(result)).toBe(true);
			if (R.isFailure(result)) {
				expect(result.error).toBeInstanceOf(IssueTokenError);
			}
		});
	});

	describe("ネットワークエラーの場合", () => {
		beforeEach(() => {
			mockFetchNetworkError();
		});

		test("IssueTokenErrorが返されること", async () => {
			const result = await issueToken({
				databaseName: "test-db",
				expiresInDays: null,
			});

			expect(R.isFailure(result)).toBe(true);
			if (R.isFailure(result)) {
				expect(result.error).toBeInstanceOf(IssueTokenError);
			}
		});
	});
});
