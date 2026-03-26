import { mockPrivateEnv } from "@next-lift/env/testing";
import { R } from "@praha/byethrow";
import { beforeEach, describe, expect, test } from "vitest";
import {
	mockFetch,
	mockFetchCreateDatabaseConflictGetDatabaseError,
	mockFetchCreateDatabaseConflictNotFound,
	mockFetchCreateDatabaseConflictOk,
	mockFetchCreateDatabaseOk,
	mockFetchNetworkError,
	mockFetchServerError,
} from "../../helpers/fetch-context.mock";
import {
	CreateDatabaseError,
	createDatabase,
	DatabaseNotFoundError,
	GetDatabaseError,
} from "./create-database";

mockPrivateEnv({
	TURSO_PLATFORM_API_TOKEN: "test-api-token",
	TURSO_ORGANIZATION: "test-org",
});

describe("createDatabase", () => {
	describe("正常系", () => {
		beforeEach(() => {
			mockFetchCreateDatabaseOk({
				DbId: "db-id-123",
				Hostname: "test-db.turso.io",
				Name: "test-db",
			});
		});

		test("正しいURLとボディでPOSTリクエストが送信されること", async () => {
			await createDatabase("test-db");

			expect(mockFetch).toHaveBeenCalledWith(
				"https://api.turso.tech/v1/organizations/test-org/databases",
				{
					method: "POST",
					headers: {
						Authorization: "Bearer test-api-token",
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ name: "test-db", group: "default" }),
				},
			);
		});

		test("データベース情報が返されること", async () => {
			const result = await createDatabase("test-db");

			expect(R.isSuccess(result)).toBe(true);
			if (R.isSuccess(result)) {
				expect(result.value).toEqual({
					id: "db-id-123",
					hostname: "test-db.turso.io",
					name: "test-db",
				});
			}
		});
	});

	describe("409 Conflict（既存DB）の場合", () => {
		beforeEach(() => {
			mockFetchCreateDatabaseConflictOk({
				DbId: "existing-db-id",
				Hostname: "existing-db.turso.io",
				Name: "existing-db",
			});
		});

		test("既存DB情報が返されること", async () => {
			const result = await createDatabase("existing-db");

			expect(R.isSuccess(result)).toBe(true);
			if (R.isSuccess(result)) {
				expect(result.value).toEqual({
					id: "existing-db-id",
					hostname: "existing-db.turso.io",
					name: "existing-db",
				});
			}
		});

		test("GETリクエストでDB情報が取得されること", async () => {
			await createDatabase("existing-db");

			expect(mockFetch).toHaveBeenCalledTimes(2);
			expect(mockFetch).toHaveBeenNthCalledWith(
				2,
				"https://api.turso.tech/v1/organizations/test-org/databases/existing-db",
				{
					method: "GET",
					headers: {
						Authorization: "Bearer test-api-token",
					},
				},
			);
		});
	});

	describe("409後にDB情報の取得に失敗した場合", () => {
		beforeEach(() => {
			mockFetchCreateDatabaseConflictGetDatabaseError();
		});

		test("GetDatabaseErrorが返されること", async () => {
			const result = await createDatabase("test-db");

			expect(R.isFailure(result)).toBe(true);
			if (R.isFailure(result)) {
				expect(result.error).toBeInstanceOf(GetDatabaseError);
			}
		});
	});

	describe("409後にDBが見つからない場合", () => {
		beforeEach(() => {
			mockFetchCreateDatabaseConflictNotFound();
		});

		test("DatabaseNotFoundErrorが返されること", async () => {
			const result = await createDatabase("test-db");

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

		test("CreateDatabaseErrorが返されること", async () => {
			const result = await createDatabase("test-db");

			expect(R.isFailure(result)).toBe(true);
			if (R.isFailure(result)) {
				expect(result.error).toBeInstanceOf(CreateDatabaseError);
			}
		});
	});

	describe("ネットワークエラーの場合", () => {
		beforeEach(() => {
			mockFetchNetworkError();
		});

		test("CreateDatabaseErrorが返されること", async () => {
			const result = await createDatabase("test-db");

			expect(R.isFailure(result)).toBe(true);
			if (R.isFailure(result)) {
				expect(result.error).toBeInstanceOf(CreateDatabaseError);
			}
		});
	});
});
