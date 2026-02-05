import { DeleteDatabaseError } from "@next-lift/turso/delete-database";
import {
	mockDeleteDatabaseError,
	mockDeleteDatabaseOk,
} from "@next-lift/turso/testing";
import { R } from "@praha/byethrow";
import { beforeEach, describe, expect, test } from "vitest";
import {
	DestroyAuthDatabaseError,
	destroyAuthDatabase,
} from "./destroy-auth-database";

describe("destroyAuthDatabase", () => {
	describe("正常系", () => {
		let deleteDatabaseSpy: ReturnType<typeof mockDeleteDatabaseOk>;

		beforeEach(() => {
			deleteDatabaseSpy = mockDeleteDatabaseOk();
		});

		test("正しいDB名でdeleteDatabaseが呼ばれること", async () => {
			await destroyAuthDatabase("gntk");

			expect(deleteDatabaseSpy).toHaveBeenCalledWith("next-lift-dev-gntk-auth");
		});

		test("成功が返されること", async () => {
			const result = await destroyAuthDatabase("gntk");

			expect(R.isSuccess(result)).toBe(true);
		});
	});

	describe("DB削除に失敗したとき", () => {
		beforeEach(() => {
			mockDeleteDatabaseError(new DeleteDatabaseError());
		});

		test("DestroyAuthDatabaseErrorが返されること", async () => {
			const result = await destroyAuthDatabase("gntk");

			expect(R.isFailure(result)).toBe(true);
			if (R.isFailure(result)) {
				expect(result.error).toBeInstanceOf(DestroyAuthDatabaseError);
			}
		});
	});
});
