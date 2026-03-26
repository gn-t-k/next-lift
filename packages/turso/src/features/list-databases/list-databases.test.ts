import { mockPrivateEnv } from "@next-lift/env/testing";
import { R } from "@praha/byethrow";
import { beforeEach, describe, expect, test } from "vitest";
import {
	mockFetch,
	mockFetchListDatabasesOk,
	mockFetchNetworkError,
	mockFetchServerError,
} from "../../helpers/fetch-context.mock";
import { ListDatabasesError, listDatabases } from "./list-databases";

mockPrivateEnv({
	TURSO_PLATFORM_API_TOKEN: "test-api-token",
	TURSO_ORGANIZATION: "test-org",
});

describe("listDatabases", () => {
	describe("正常系", () => {
		const mockApiResponse = [
			{ Name: "next-lift-production-auth" },
			{ Name: "next-lift-preview-pr123-auth" },
			{ Name: "next-lift-preview-pr456-auth" },
		];

		const expectedDatabases = [
			{ name: "next-lift-production-auth" },
			{ name: "next-lift-preview-pr123-auth" },
			{ name: "next-lift-preview-pr456-auth" },
		];

		beforeEach(() => {
			mockFetchListDatabasesOk(mockApiResponse);
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
				expect(result.value).toEqual(expectedDatabases);
			}
		});
	});

	describe("空のデータベース一覧の場合", () => {
		beforeEach(() => {
			mockFetchListDatabasesOk([]);
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
			mockFetchServerError();
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
			mockFetchNetworkError();
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
