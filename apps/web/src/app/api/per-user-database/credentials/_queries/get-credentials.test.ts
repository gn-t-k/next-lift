import {
	mockGetValidCredentialsError,
	mockGetValidCredentialsOk,
} from "@next-lift/authentication/testing";
import {
	CredentialsNotFoundError,
	FindCredentialsError,
} from "@next-lift/authentication/user-database-credentials";
import { R } from "@praha/byethrow";
import { beforeEach, describe, expect, test } from "vitest";
import { getCredentials } from "./get-credentials";

describe("getCredentials", () => {
	describe("クレデンシャルが見つからないとき", () => {
		beforeEach(() => {
			mockGetValidCredentialsError(new CredentialsNotFoundError());
		});

		test("CredentialsNotFoundErrorが返されること", async () => {
			const result = await getCredentials("user-1");

			expect(R.isFailure(result)).toBe(true);
			if (R.isFailure(result)) {
				expect(result.error).toBeInstanceOf(CredentialsNotFoundError);
			}
		});
	});

	describe("その他のエラーが発生したとき", () => {
		beforeEach(() => {
			mockGetValidCredentialsError(new FindCredentialsError());
		});

		test("FindCredentialsErrorが返されること", async () => {
			const result = await getCredentials("user-1");

			expect(R.isFailure(result)).toBe(true);
			if (R.isFailure(result)) {
				expect(result.error).toBeInstanceOf(FindCredentialsError);
			}
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

		test("APIレスポンス形式のクレデンシャルが返されること", async () => {
			const result = await getCredentials("user-1");

			expect(R.isSuccess(result)).toBe(true);
			if (R.isSuccess(result)) {
				expect(result.value).toEqual({
					url: "libsql://test-db.turso.io",
					authToken: "test-token",
					expiresAt: "2026-12-31T00:00:00.000Z",
				});
			}
		});
	});
});
