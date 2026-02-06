import { R } from "@praha/byethrow";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { IssueTokenError, issueToken } from "./issue-token";

// 環境変数のモック
vi.mock("@next-lift/env/private", () => ({
	env: {
		TURSO_PLATFORM_API_TOKEN: "test-api-token",
		TURSO_ORGANIZATION: "test-org",
	},
}));

describe("issueToken", () => {
	const mockFetch = vi.fn();
	const originalFetch = globalThis.fetch;

	beforeEach(() => {
		globalThis.fetch = mockFetch;
	});

	afterEach(() => {
		globalThis.fetch = originalFetch;
		vi.clearAllMocks();
	});

	describe("有効期限付きトークン", () => {
		const NOW = new Date("2025-01-01T00:00:00.000Z");

		beforeEach(() => {
			mockFetch.mockResolvedValue({
				ok: true,
				status: 200,
				json: async () => ({ jwt: "test-jwt-token" }),
			});
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
			mockFetch.mockResolvedValue({
				ok: true,
				status: 200,
				json: async () => ({ jwt: "permanent-jwt-token" }),
			});
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
			mockFetch.mockResolvedValue({
				ok: false,
				status: 500,
				statusText: "Internal Server Error",
				text: async () => "Server error details",
			});
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
			mockFetch.mockRejectedValue(new Error("Network error"));
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
