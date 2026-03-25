import {
	mockSaveCredentialsError,
	mockSaveCredentialsOk,
} from "@next-lift/authentication/testing";
import { UpsertCredentialsError } from "@next-lift/authentication/user-database-credentials";
import { ApplyMigrationError } from "@next-lift/per-user-database/apply-migration";
import { CreateTursoPerUserDatabaseError } from "@next-lift/per-user-database/create-database";
import {
	mockApplyMigrationError,
	mockApplyMigrationOk,
	mockCreateTursoPerUserDatabaseError,
	mockCreateTursoPerUserDatabaseOk,
} from "@next-lift/per-user-database/testing";
import { R } from "@praha/byethrow";
import { beforeEach, describe, expect, test } from "vitest";
import { setupPerUserDatabase } from "./setup-per-user-database";

describe("setupPerUserDatabase", () => {
	describe("すべてのステップが成功するとき", () => {
		let saveCredentialsSpy: ReturnType<typeof mockSaveCredentialsOk>;

		beforeEach(() => {
			mockCreateTursoPerUserDatabaseOk({
				name: "test-db",
				url: "libsql://test-db.turso.io",
				authToken: "test-token",
				expiresAt: new Date("2026-12-31T00:00:00.000Z"),
			});
			mockApplyMigrationOk();
			saveCredentialsSpy = mockSaveCredentialsOk();
		});

		test("voidが返されること", async () => {
			const result = await setupPerUserDatabase({ userId: "user-1" });

			expect(R.isSuccess(result)).toBe(true);
		});

		test("saveCredentialsが正しい引数で呼ばれること", async () => {
			await setupPerUserDatabase({ userId: "user-1" });

			expect(saveCredentialsSpy).toHaveBeenCalledWith({
				userId: "user-1",
				dbName: "test-db",
				url: "libsql://test-db.turso.io",
				token: "test-token",
				expiresAt: new Date("2026-12-31T00:00:00.000Z"),
			});
		});
	});

	describe("DB作成が失敗したとき", () => {
		beforeEach(() => {
			mockCreateTursoPerUserDatabaseError(
				new CreateTursoPerUserDatabaseError(),
			);
			mockApplyMigrationOk();
			mockSaveCredentialsOk();
		});

		test("CreateTursoPerUserDatabaseErrorが返されること", async () => {
			const result = await setupPerUserDatabase({ userId: "user-1" });

			expect(R.isFailure(result)).toBe(true);
			if (R.isFailure(result)) {
				expect(result.error).toBeInstanceOf(CreateTursoPerUserDatabaseError);
			}
		});
	});

	describe("マイグレーションが失敗したとき", () => {
		beforeEach(() => {
			mockCreateTursoPerUserDatabaseOk();
			mockApplyMigrationError(new ApplyMigrationError());
			mockSaveCredentialsOk();
		});

		test("ApplyMigrationErrorが返されること", async () => {
			const result = await setupPerUserDatabase({ userId: "user-1" });

			expect(R.isFailure(result)).toBe(true);
			if (R.isFailure(result)) {
				expect(result.error).toBeInstanceOf(ApplyMigrationError);
			}
		});
	});

	describe("クレデンシャル保存が失敗したとき", () => {
		beforeEach(() => {
			mockCreateTursoPerUserDatabaseOk();
			mockApplyMigrationOk();
			mockSaveCredentialsError(new UpsertCredentialsError());
		});

		test("UpsertCredentialsErrorが返されること", async () => {
			const result = await setupPerUserDatabase({ userId: "user-1" });

			expect(R.isFailure(result)).toBe(true);
			if (R.isFailure(result)) {
				expect(result.error).toBeInstanceOf(UpsertCredentialsError);
			}
		});
	});
});
