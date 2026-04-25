import { R } from "@praha/byethrow";
import { beforeEach, describe, expect, test } from "vitest";
import { ApplyMigrationError } from "../apply-migration/apply-migration";
import {
	mockMigrateDatabaseError,
	mockMigrateDatabaseOk,
} from "../apply-migration/migrate-database.mock";
import { getPerUserDatabase } from "./index";
import { runInPerUserDatabaseScope } from "./run-in-per-user-database-scope";

describe("runInPerUserDatabaseScope", () => {
	describe("マイグレーションが成功したとき", () => {
		beforeEach(() => {
			mockMigrateDatabaseOk();
		});

		test("コールバックが per-user DB スコープ内で実行されること", async () => {
			const result = await runInPerUserDatabaseScope(
				{ url: ":memory:", authToken: "" },
				() => {
					const db = getPerUserDatabase();
					return db;
				},
			);

			expect(R.isSuccess(result)).toBe(true);
			if (R.isSuccess(result)) {
				expect(result.value).toBeDefined();
			}
		});

		test("非同期コールバックの結果が flatten されること", async () => {
			const result = await runInPerUserDatabaseScope(
				{ url: ":memory:", authToken: "" },
				async () => "async-result",
			);

			expect(R.isSuccess(result)).toBe(true);
			if (R.isSuccess(result)) {
				expect(result.value).toBe("async-result");
			}
		});
	});

	describe("マイグレーションが失敗したとき", () => {
		beforeEach(() => {
			mockMigrateDatabaseError(new Error("migration failed"));
		});

		test("ApplyMigrationErrorが返されること", async () => {
			const result = await runInPerUserDatabaseScope(
				{ url: ":memory:", authToken: "" },
				() => "should not reach",
			);

			expect(R.isFailure(result)).toBe(true);
			if (R.isFailure(result)) {
				expect(result.error).toBeInstanceOf(ApplyMigrationError);
			}
		});
	});
});
