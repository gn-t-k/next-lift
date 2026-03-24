import { R } from "@praha/byethrow";
import { mockContext } from "@praha/diva/test";
import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, test } from "vitest";
import { perUserDatabase } from "../../../database-schemas";
import { withDatabase } from "../../../helpers/database-context";
import { factories } from "../../../testing/factories";
import { mockedAuthenticationDatabase } from "../../../testing/mocked-authentication-database";
import {
	CredentialsNotFoundOnDeleteError,
	removeCredentials,
} from "./remove-credentials";

mockContext(withDatabase, () => mockedAuthenticationDatabase);

describe("removeCredentials", () => {
	describe("レコードが存在するとき", () => {
		let testUserId: string;

		beforeEach(async () => {
			const record = await factories(
				mockedAuthenticationDatabase,
			).perUserDatabases.create();
			testUserId = record.userId;
		});

		test("レコードが削除されること", async () => {
			const result = await removeCredentials(testUserId);

			expect(R.isSuccess(result)).toBe(true);

			const records = await mockedAuthenticationDatabase
				.select()
				.from(perUserDatabase)
				.where(eq(perUserDatabase.userId, testUserId));

			expect(records).toEqual([]);
		});
	});

	describe("レコードが存在しないとき", () => {
		test("CredentialsNotFoundOnDeleteErrorが返ること", async () => {
			const result = await removeCredentials("non-existent-user");

			expect(R.isFailure(result)).toBe(true);
			if (R.isFailure(result)) {
				expect(result.error).toBeInstanceOf(CredentialsNotFoundOnDeleteError);
			}
		});
	});
});
