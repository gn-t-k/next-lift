import { mockPrivateEnv } from "@next-lift/env/testing";
import { R } from "@praha/byethrow";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { CreateDatabaseError, createDatabase } from "./create-database";
import * as getDatabaseModule from "./get-database";

mockPrivateEnv({
	TURSO_PLATFORM_API_TOKEN: "test-api-token",
	TURSO_ORGANIZATION: "test-org",
});

describe("createDatabase", () => {
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
				status: 201,
				json: async () => ({
					database: {
						DbId: "db-id-123",
						Hostname: "test-db.turso.io",
						Name: "test-db",
					},
				}),
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
			mockFetch.mockResolvedValue({
				ok: false,
				status: 409,
			});

			vi.spyOn(getDatabaseModule, "getDatabase").mockResolvedValue(
				R.succeed({
					id: "existing-db-id",
					hostname: "existing-db.turso.io",
					name: "existing-db",
				}),
			);
		});

		test("getDatabaseが呼ばれて既存DB情報が返されること", async () => {
			const result = await createDatabase("existing-db");

			expect(getDatabaseModule.getDatabase).toHaveBeenCalledWith("existing-db");
			expect(R.isSuccess(result)).toBe(true);
			if (R.isSuccess(result)) {
				expect(result.value).toEqual({
					id: "existing-db-id",
					hostname: "existing-db.turso.io",
					name: "existing-db",
				});
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
			mockFetch.mockRejectedValue(new Error("Network error"));
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
