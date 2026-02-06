import { CreateDatabaseError } from "@next-lift/turso/create-database";
import { IssueTokenError } from "@next-lift/turso/issue-token";
import {
	mockCreateDatabaseError,
	mockCreateDatabaseOk,
	mockIssueTokenError,
	mockIssueTokenOk,
} from "@next-lift/turso/testing";
import { R } from "@praha/byethrow";
import { beforeEach, describe, expect, test } from "vitest";
import { ApplyAuthMigrationError } from "./apply-auth-migration";
import {
	mockApplyAuthMigrationError,
	mockApplyAuthMigrationOk,
} from "./apply-auth-migration.mock";
import {
	CreateAuthDatabaseError,
	createAuthDatabase,
} from "./create-auth-database";

describe("createAuthDatabase", () => {
	describe("正常系", () => {
		let createDatabaseSpy: ReturnType<typeof mockCreateDatabaseOk>;
		let issueTokenSpy: ReturnType<typeof mockIssueTokenOk>;
		let applyAuthMigrationSpy: ReturnType<typeof mockApplyAuthMigrationOk>;

		beforeEach(() => {
			createDatabaseSpy = mockCreateDatabaseOk({
				id: "db-id-123",
				hostname: "next-lift-development-gntk-auth.turso.io",
				name: "next-lift-development-gntk-auth",
			});
			issueTokenSpy = mockIssueTokenOk({ jwt: "dev-token-jwt" });
			applyAuthMigrationSpy = mockApplyAuthMigrationOk();
		});

		test("正しいDB名でcreateDatabaseが呼ばれること", async () => {
			await createAuthDatabase("gntk");

			expect(createDatabaseSpy).toHaveBeenCalledWith(
				"next-lift-development-gntk-auth",
			);
		});

		test("開発者名が大文字の場合、小文字に変換されること", async () => {
			await createAuthDatabase("GnTk");

			expect(createDatabaseSpy).toHaveBeenCalledWith(
				"next-lift-development-gntk-auth",
			);
		});

		test("開発者名にアンダースコアがある場合、ハイフンに変換されること", async () => {
			createDatabaseSpy = mockCreateDatabaseOk({
				id: "db-id-123",
				hostname: "next-lift-development-gn-t-k-auth.turso.io",
				name: "next-lift-development-gn-t-k-auth",
			});

			await createAuthDatabase("gn_t_k");

			expect(createDatabaseSpy).toHaveBeenCalledWith(
				"next-lift-development-gn-t-k-auth",
			);
		});

		test("発行されたトークンが無期限であること", async () => {
			await createAuthDatabase("gntk");

			expect(issueTokenSpy).toHaveBeenCalledWith({
				databaseName: "next-lift-development-gntk-auth",
				expiresInDays: null,
			});
		});

		test("マイグレーションが正しいURL・トークンで適用されること", async () => {
			await createAuthDatabase("gntk");

			expect(applyAuthMigrationSpy).toHaveBeenCalledWith({
				url: "libsql://next-lift-development-gntk-auth.turso.io",
				authToken: "dev-token-jwt",
			});
		});

		test("接続情報が返されること", async () => {
			const result = await createAuthDatabase("gntk");

			expect(R.isSuccess(result)).toBe(true);
			if (R.isSuccess(result)) {
				expect(result.value).toEqual(
					expect.objectContaining({
						url: "libsql://next-lift-development-gntk-auth.turso.io",
						authToken: "dev-token-jwt",
						databaseName: "next-lift-development-gntk-auth",
					}),
				);
			}
		});
	});

	describe("DB作成に失敗したとき", () => {
		beforeEach(() => {
			mockCreateDatabaseError(new CreateDatabaseError());
		});

		test("CreateAuthDatabaseErrorが返されること", async () => {
			const result = await createAuthDatabase("gntk");

			expect(R.isFailure(result)).toBe(true);
			if (R.isFailure(result)) {
				expect(result.error).toBeInstanceOf(CreateAuthDatabaseError);
			}
		});
	});

	describe("トークン発行に失敗したとき", () => {
		beforeEach(() => {
			mockCreateDatabaseOk({
				id: "db-id-123",
				hostname: "next-lift-development-gntk-auth.turso.io",
				name: "next-lift-development-gntk-auth",
			});
			mockIssueTokenError(new IssueTokenError());
		});

		test("CreateAuthDatabaseErrorが返されること", async () => {
			const result = await createAuthDatabase("gntk");

			expect(R.isFailure(result)).toBe(true);
			if (R.isFailure(result)) {
				expect(result.error).toBeInstanceOf(CreateAuthDatabaseError);
			}
		});
	});

	describe("マイグレーション適用に失敗したとき", () => {
		beforeEach(() => {
			mockCreateDatabaseOk({
				id: "db-id-123",
				hostname: "next-lift-development-gntk-auth.turso.io",
				name: "next-lift-development-gntk-auth",
			});
			mockIssueTokenOk({ jwt: "dev-token-jwt" });
			mockApplyAuthMigrationError(new ApplyAuthMigrationError());
		});

		test("CreateAuthDatabaseErrorが返されること", async () => {
			const result = await createAuthDatabase("gntk");

			expect(R.isFailure(result)).toBe(true);
			if (R.isFailure(result)) {
				expect(result.error).toBeInstanceOf(CreateAuthDatabaseError);
			}
		});
	});
});
