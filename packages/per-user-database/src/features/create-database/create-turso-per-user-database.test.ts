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
import {
	CreateTursoPerUserDatabaseError,
	createTursoPerUserDatabase,
} from "./create-turso-per-user-database";

const NOW = new Date("2025-01-01T00:00:00.000Z");

describe("createTursoPerUserDatabase", () => {
	describe("正常系", () => {
		let createDatabaseSpy: ReturnType<typeof mockCreateDatabaseOk>;
		let issueTokenSpy: ReturnType<typeof mockIssueTokenOk>;

		beforeEach(() => {
			createDatabaseSpy = mockCreateDatabaseOk({
				id: "db-id-123",
				hostname: "next-lift-test-user-user-1.turso.io",
				name: "next-lift-test-user-user-1",
			});
			issueTokenSpy = mockIssueTokenOk({
				jwt: "per-user-token-jwt",
				expiresAt: new Date("2025-01-31T00:00:00.000Z"),
			});
		});

		test("正しいDB名でcreateDatabaseが呼ばれること", async () => {
			await createTursoPerUserDatabase("user-1", NOW);

			expect(createDatabaseSpy).toHaveBeenCalledWith(
				"next-lift-test-user-user-1",
			);
		});

		test("30日間有効なトークンが発行されること", async () => {
			await createTursoPerUserDatabase("user-1", NOW);

			expect(issueTokenSpy).toHaveBeenCalledWith({
				databaseName: "next-lift-test-user-user-1",
				expiresInDays: 30,
				startingFrom: NOW,
			});
		});

		test("DB接続情報が返されること", async () => {
			const result = await createTursoPerUserDatabase("user-1", NOW);

			expect(R.isSuccess(result)).toBe(true);
			if (R.isSuccess(result)) {
				expect(result.value).toEqual({
					name: "next-lift-test-user-user-1",
					url: "libsql://next-lift-test-user-user-1.turso.io",
					authToken: "per-user-token-jwt",
					expiresAt: new Date("2025-01-31T00:00:00.000Z"),
				});
			}
		});
	});

	describe("DB作成に失敗したとき", () => {
		beforeEach(() => {
			mockCreateDatabaseError(new CreateDatabaseError());
		});

		test("CreateTursoPerUserDatabaseErrorが返されること", async () => {
			const result = await createTursoPerUserDatabase("user-1", NOW);

			expect(R.isFailure(result)).toBe(true);
			if (R.isFailure(result)) {
				expect(result.error).toBeInstanceOf(CreateTursoPerUserDatabaseError);
			}
		});
	});

	describe("トークン発行に失敗したとき", () => {
		beforeEach(() => {
			mockCreateDatabaseOk({
				id: "db-id-123",
				hostname: "next-lift-test-user-user-1.turso.io",
				name: "next-lift-test-user-user-1",
			});
			mockIssueTokenError(new IssueTokenError());
		});

		test("CreateTursoPerUserDatabaseErrorが返されること", async () => {
			const result = await createTursoPerUserDatabase("user-1", NOW);

			expect(R.isFailure(result)).toBe(true);
			if (R.isFailure(result)) {
				expect(result.error).toBeInstanceOf(CreateTursoPerUserDatabaseError);
			}
		});
	});
});
