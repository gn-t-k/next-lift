import {
	mockGetValidCredentialsError,
	mockGetValidCredentialsOk,
} from "@next-lift/authentication/testing";
import {
	GetUserDatabaseCredentialsError,
	UserDatabaseCredentialsNotFoundError,
} from "@next-lift/authentication/user-database-credentials";
import { beforeEach, describe, expect, test } from "vitest";
import { getCredentialsResponse } from "./get-credentials-response";

describe("getCredentialsResponse", () => {
	describe("クレデンシャルが見つからないとき", () => {
		beforeEach(() => {
			mockGetValidCredentialsError(new UserDatabaseCredentialsNotFoundError());
		});

		test("404 Not Foundが返されること", async () => {
			const response = await getCredentialsResponse("user-1");

			expect(response.status).toBe(404);
			expect(await response.text()).toBe("Not Found");
		});
	});

	describe("その他のエラーが発生したとき", () => {
		beforeEach(() => {
			mockGetValidCredentialsError(new GetUserDatabaseCredentialsError());
		});

		test("500 Internal Server Errorが返されること", async () => {
			const response = await getCredentialsResponse("user-1");

			expect(response.status).toBe(500);
			expect(await response.text()).toBe("Internal Server Error");
		});
	});

	describe("クレデンシャルが取得できたとき", () => {
		beforeEach(() => {
			mockGetValidCredentialsOk({
				url: "libsql://test-db.turso.io",
				token: "test-token",
				expiresAt: new Date("2026-12-31T00:00:00.000Z"),
			});
		});

		test("200とJSON bodyが返されること", async () => {
			const response = await getCredentialsResponse("user-1");

			expect(response.status).toBe(200);
			expect(await response.json()).toEqual({
				url: "libsql://test-db.turso.io",
				authToken: "test-token",
				expiresAt: "2026-12-31T00:00:00.000Z",
			});
		});

		test("Cache-Control: no-storeヘッダーが設定されること", async () => {
			const response = await getCredentialsResponse("user-1");

			expect(response.headers.get("Cache-Control")).toBe("no-store");
		});
	});
});
