import { R } from "@praha/byethrow";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { ListDatabasesError, listDatabases } from "./list-databases";

// 環境変数のモック
vi.mock("@next-lift/env/private", () => ({
	env: {
		TURSO_PLATFORM_API_TOKEN: "test-api-token",
		TURSO_ORGANIZATION: "test-org",
	},
}));

describe("listDatabases", () => {
	const mockFetch = vi.fn();
	const originalFetch = globalThis.fetch;

	beforeEach(() => {
		globalThis.fetch = mockFetch;
	});

	afterEach(() => {
		globalThis.fetch = originalFetch;
		vi.clearAllMocks();
	});

	describe("正常系", () => {
		const mockDatabases = [
			{ name: "next-lift-production-auth" },
			{ name: "next-lift-preview-pr123-auth" },
			{ name: "next-lift-preview-pr456-auth" },
		];

		beforeEach(() => {
			mockFetch.mockResolvedValue({
				ok: true,
				status: 200,
				json: async () => ({ databases: mockDatabases }),
			});
		});

		test("正しいURLとヘッダーでGETリクエストが送信されること", async () => {
			await listDatabases();

			expect(mockFetch).toHaveBeenCalledWith(
				"https://api.turso.tech/v1/organizations/test-org/databases",
				{
					method: "GET",
					headers: {
						Authorization: "Bearer test-api-token",
					},
				},
			);
		});

		test("成功した場合、データベース一覧が返されること", async () => {
			const result = await listDatabases();

			expect(R.isSuccess(result)).toBe(true);
			if (R.isSuccess(result)) {
				expect(result.value).toEqual(mockDatabases);
			}
		});
	});

	describe("空のデータベース一覧の場合", () => {
		beforeEach(() => {
			mockFetch.mockResolvedValue({
				ok: true,
				status: 200,
				json: async () => ({ databases: [] }),
			});
		});

		test("空の配列が返されること", async () => {
			const result = await listDatabases();

			expect(R.isSuccess(result)).toBe(true);
			if (R.isSuccess(result)) {
				expect(result.value).toEqual([]);
			}
		});
	});

	describe("APIエラーの場合", () => {
		beforeEach(() => {
			mockFetch.mockResolvedValue({
				ok: false,
				status: 500,
				statusText: "Internal Server Error",
				text: async () => "Server error details",
			});
		});

		test("ListDatabasesErrorが返されること", async () => {
			const result = await listDatabases();

			expect(R.isFailure(result)).toBe(true);
			if (R.isFailure(result)) {
				expect(result.error).toBeInstanceOf(ListDatabasesError);
			}
		});
	});

	describe("ネットワークエラーの場合", () => {
		beforeEach(() => {
			mockFetch.mockRejectedValue(new Error("Network error"));
		});

		test("ListDatabasesErrorが返されること", async () => {
			const result = await listDatabases();

			expect(R.isFailure(result)).toBe(true);
			if (R.isFailure(result)) {
				expect(result.error).toBeInstanceOf(ListDatabasesError);
				expect(result.error.cause).toBeInstanceOf(Error);
			}
		});
	});

	describe("不正なレスポンスの場合", () => {
		beforeEach(() => {
			mockFetch.mockResolvedValue({
				ok: true,
				status: 200,
				json: async () => ({ invalid: "response" }),
			});
		});

		test("ListDatabasesErrorが返されること", async () => {
			const result = await listDatabases();

			expect(R.isFailure(result)).toBe(true);
			if (R.isFailure(result)) {
				expect(result.error).toBeInstanceOf(ListDatabasesError);
			}
		});
	});
});
