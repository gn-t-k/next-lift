import { mockPrivateEnv } from "@next-lift/env/testing";
import { R } from "@praha/byethrow";
import { beforeEach, describe, expect, test } from "vitest";
import {
	mockFetch,
	mockFetchDeleteDatabaseNotFound,
	mockFetchDeleteDatabaseOk,
	mockFetchNetworkError,
	mockFetchServerError,
} from "../../helpers/fetch-context.mock";
import {
	DatabaseNotFoundError,
	DeleteDatabaseError,
	deleteDatabase,
} from "./delete-database";

mockPrivateEnv({
	TURSO_PLATFORM_API_TOKEN: "test-api-token",
	TURSO_ORGANIZATION: "test-org",
});

describe("deleteDatabase", () => {
	describe("正常系", () => {
		beforeEach(() => {
			mockFetchDeleteDatabaseOk();
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
			mockFetchDeleteDatabaseNotFound();
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
			mockFetchServerError();
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
			mockFetchNetworkError();
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
