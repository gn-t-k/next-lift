import { R } from "@praha/byethrow";
import { beforeEach, describe, expect, test } from "vitest";
import { CreateAuthDatabaseError } from "./create-auth-database";
import {
	mockCreateAuthDatabaseError,
	mockCreateAuthDatabaseOk,
} from "./create-auth-database.mock";
import { DestroyAuthDatabaseError } from "./destroy-auth-database";
import {
	mockDestroyAuthDatabaseError,
	mockDestroyAuthDatabaseOk,
} from "./destroy-auth-database.mock";
import {
	ResetAuthDatabaseError,
	resetAuthDatabase,
} from "./reset-auth-database";

describe("resetAuthDatabase", () => {
	describe("正常系", () => {
		let destroyAuthDatabaseSpy: ReturnType<typeof mockDestroyAuthDatabaseOk>;
		let createAuthDatabaseSpy: ReturnType<typeof mockCreateAuthDatabaseOk>;

		beforeEach(() => {
			destroyAuthDatabaseSpy = mockDestroyAuthDatabaseOk();
			createAuthDatabaseSpy = mockCreateAuthDatabaseOk({
				url: "libsql://next-lift-dev-gntk-auth.turso.io",
				authToken: "dev-token-jwt",
				databaseName: "next-lift-dev-gntk-auth",
			});
		});

		test("destroyAuthDatabaseが呼ばれること", async () => {
			await resetAuthDatabase("gntk");

			expect(destroyAuthDatabaseSpy).toHaveBeenCalledWith("gntk");
		});

		test("createAuthDatabaseが呼ばれること", async () => {
			await resetAuthDatabase("gntk");

			expect(createAuthDatabaseSpy).toHaveBeenCalledWith("gntk");
		});

		test("接続情報が返されること", async () => {
			const result = await resetAuthDatabase("gntk");

			expect(R.isSuccess(result)).toBe(true);
			if (R.isSuccess(result)) {
				expect(result.value).toEqual({
					url: "libsql://next-lift-dev-gntk-auth.turso.io",
					authToken: "dev-token-jwt",
					databaseName: "next-lift-dev-gntk-auth",
				});
			}
		});
	});

	describe("削除に失敗したとき", () => {
		beforeEach(() => {
			mockDestroyAuthDatabaseError(new DestroyAuthDatabaseError());
		});

		test("ResetAuthDatabaseErrorが返されること", async () => {
			const result = await resetAuthDatabase("gntk");

			expect(R.isFailure(result)).toBe(true);
			if (R.isFailure(result)) {
				expect(result.error).toBeInstanceOf(ResetAuthDatabaseError);
			}
		});
	});

	describe("再作成に失敗したとき", () => {
		beforeEach(() => {
			mockDestroyAuthDatabaseOk();
			mockCreateAuthDatabaseError(new CreateAuthDatabaseError());
		});

		test("ResetAuthDatabaseErrorが返されること", async () => {
			const result = await resetAuthDatabase("gntk");

			expect(R.isFailure(result)).toBe(true);
			if (R.isFailure(result)) {
				expect(result.error).toBeInstanceOf(ResetAuthDatabaseError);
			}
		});
	});
});
