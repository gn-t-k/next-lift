import {
	mockGetValidCredentialsError,
	mockGetValidCredentialsOk,
} from "@next-lift/authentication/testing";
import { CredentialsNotFoundError } from "@next-lift/authentication/user-database-credentials";
import { mockRunInPerUserDatabaseScopeOk } from "@next-lift/per-user-database/testing";
import { R } from "@praha/byethrow";
import { beforeEach, describe, expect, test } from "vitest";
import { runWithPerUserDatabase } from "./per-user-database-context";

describe("runWithPerUserDatabase", () => {
	describe("クレデンシャル取得が成功したとき", () => {
		let scopeSpy: ReturnType<typeof mockRunInPerUserDatabaseScopeOk>;

		beforeEach(() => {
			mockGetValidCredentialsOk({
				url: "libsql://test-db.turso.io",
				token: "test-token",
			});
			scopeSpy = mockRunInPerUserDatabaseScopeOk();
		});

		test("runInPerUserDatabaseScope にクレデンシャルが渡されること", async () => {
			await runWithPerUserDatabase("user-1", () => "callback");

			expect(scopeSpy).toHaveBeenCalledWith(
				{ url: "libsql://test-db.turso.io", authToken: "test-token" },
				expect.any(Function),
			);
		});

		test("結果が返されること", async () => {
			const result = await runWithPerUserDatabase("user-1", () => "callback");

			expect(R.isSuccess(result)).toBe(true);
		});
	});

	describe("クレデンシャル取得が失敗したとき", () => {
		beforeEach(() => {
			mockGetValidCredentialsError(new CredentialsNotFoundError());
		});

		test("CredentialsNotFoundErrorが返されること", async () => {
			const result = await runWithPerUserDatabase("user-1", () => "callback");

			expect(R.isFailure(result)).toBe(true);
			if (R.isFailure(result)) {
				expect(result.error).toBeInstanceOf(CredentialsNotFoundError);
			}
		});
	});
});
