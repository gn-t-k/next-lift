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
				hostname: "next-lift-development-test-user-c6c289e49e9c05b2.turso.io",
				name: "next-lift-development-test-user-c6c289e49e9c05b2",
			});
			issueTokenSpy = mockIssueTokenOk({
				jwt: "per-user-token-jwt",
				expiresAt: new Date("2025-01-31T00:00:00.000Z"),
			});
		});

		test("正しいDB名でcreateDatabaseが呼ばれること", async () => {
			await createTursoPerUserDatabase("user-1", NOW);

			expect(createDatabaseSpy).toHaveBeenCalledWith(
				"next-lift-development-test-user-c6c289e49e9c05b2",
			);
		});

		test("userIdが大文字の場合、小文字に変換されること", async () => {
			await createTursoPerUserDatabase("User-1", NOW);

			expect(createDatabaseSpy).toHaveBeenCalledWith(
				"next-lift-development-test-user-c6c289e49e9c05b2",
			);
		});

		test("userIdにアンダースコアがある場合、ハイフンに変換されること", async () => {
			createDatabaseSpy = mockCreateDatabaseOk({
				id: "db-id-123",
				hostname: "next-lift-development-test-user-1e400cee7ba55d4f.turso.io",
				name: "next-lift-development-test-user-1e400cee7ba55d4f",
			});

			await createTursoPerUserDatabase("user_1_abc", NOW);

			expect(createDatabaseSpy).toHaveBeenCalledWith(
				"next-lift-development-test-user-1e400cee7ba55d4f",
			);
		});

		test("userIdがUUID形式の場合、16文字のハッシュに短縮されること", async () => {
			const uuid = "550e8400-e29b-41d4-a716-446655440000";
			createDatabaseSpy = mockCreateDatabaseOk({
				id: "db-id-123",
				hostname: "next-lift-development-test-user-hash.turso.io",
				name: "next-lift-development-test-user-hash",
			});

			await createTursoPerUserDatabase(uuid, NOW);

			const calledDbName = createDatabaseSpy.mock.calls[0]?.[0];
			expect(calledDbName).toMatch(
				/^next-lift-development-test-user-[a-f0-9]{16}$/,
			);
		});

		test("同じuserIdは常に同じDB名を生成すること", async () => {
			const uuid = "550e8400-e29b-41d4-a716-446655440000";
			createDatabaseSpy = mockCreateDatabaseOk({
				id: "db-id-123",
				hostname: "next-lift-development-test-user-hash.turso.io",
				name: "next-lift-development-test-user-hash",
			});

			await createTursoPerUserDatabase(uuid, NOW);
			await createTursoPerUserDatabase(uuid, NOW);

			const firstCall = createDatabaseSpy.mock.calls[0]?.[0];
			const secondCall = createDatabaseSpy.mock.calls[1]?.[0];
			expect(firstCall).toBe(secondCall);
		});

		test("DB名が56文字以内であること", async () => {
			const uuid = "550e8400-e29b-41d4-a716-446655440000";
			createDatabaseSpy = mockCreateDatabaseOk({
				id: "db-id-123",
				hostname: "next-lift-development-test-user-hash.turso.io",
				name: "next-lift-development-test-user-hash",
			});

			await createTursoPerUserDatabase(uuid, NOW);

			const calledDbName = createDatabaseSpy.mock.calls[0]?.[0];
			expect(calledDbName?.length).toBeLessThanOrEqual(56);
		});

		test("30日間有効なトークンが発行されること", async () => {
			await createTursoPerUserDatabase("user-1", NOW);

			expect(issueTokenSpy).toHaveBeenCalledWith({
				databaseName: "next-lift-development-test-user-c6c289e49e9c05b2",
				expiresInDays: 30,
				startingFrom: NOW,
			});
		});

		test("DB接続情報が返されること", async () => {
			const result = await createTursoPerUserDatabase("user-1", NOW);

			expect(R.isSuccess(result)).toBe(true);
			if (R.isSuccess(result)) {
				expect(result.value).toEqual({
					name: "next-lift-development-test-user-c6c289e49e9c05b2",
					url: "libsql://next-lift-development-test-user-c6c289e49e9c05b2.turso.io",
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
				hostname: "next-lift-development-test-user-c6c289e49e9c05b2.turso.io",
				name: "next-lift-development-test-user-c6c289e49e9c05b2",
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
