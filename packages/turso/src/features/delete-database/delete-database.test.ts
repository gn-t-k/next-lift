import { R } from "@praha/byethrow";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import {
	DatabaseNotFoundError,
	DeleteDatabaseError,
	deleteDatabase,
} from "./delete-database";

// 環境変数のモック
vi.mock("@next-lift/env/private", () => ({
	env: {
		TURSO_PLATFORM_API_TOKEN: "test-api-token",
		TURSO_ORGANIZATION: "test-org",
	},
}));

describe("deleteDatabase", () => {
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
		beforeEach(() => {
			mockFetch.mockResolvedValue({
				ok: true,
				status: 200,
			});
		});

		test("正しいURLとヘッダーでDELETEリクエストが送信されること", async () => {
			await deleteDatabase("test-db");

			expect(mockFetch).toHaveBeenCalledWith(
				"https://api.turso.tech/v1/organizations/test-org/databases/test-db",
				{
					method: "DELETE",
					headers: {
						Authorization: "Bearer test-api-token",
					},
				},
			);
		});

		test("成功した場合、Successが返されること", async () => {
			const result = await deleteDatabase("test-db");

			expect(R.isSuccess(result)).toBe(true);
		});
	});

	describe("404エラーの場合", () => {
		beforeEach(() => {
			mockFetch.mockResolvedValue({
				ok: false,
				status: 404,
			});
		});

		test("DatabaseNotFoundErrorが返されること", async () => {
			const result = await deleteDatabase("non-existent-db");

			expect(R.isFailure(result)).toBe(true);
			if (R.isFailure(result)) {
				expect(result.error).toBeInstanceOf(DatabaseNotFoundError);
			}
		});
	});

	describe("その他のエラーの場合", () => {
		beforeEach(() => {
			mockFetch.mockResolvedValue({
				ok: false,
				status: 500,
				statusText: "Internal Server Error",
				text: async () => "Server error details",
			});
		});

		test("DeleteDatabaseErrorが返されること", async () => {
			const result = await deleteDatabase("test-db");

			expect(R.isFailure(result)).toBe(true);
			if (R.isFailure(result)) {
				expect(result.error).toBeInstanceOf(DeleteDatabaseError);
			}
		});
	});

	describe("ネットワークエラーの場合", () => {
		beforeEach(() => {
			mockFetch.mockRejectedValue(new Error("Network error"));
		});

		test("DeleteDatabaseErrorが返されること", async () => {
			const result = await deleteDatabase("test-db");

			expect(R.isFailure(result)).toBe(true);
			if (R.isFailure(result)) {
				expect(result.error).toBeInstanceOf(DeleteDatabaseError);
				expect(result.error.cause).toBeInstanceOf(Error);
			}
		});
	});
});
