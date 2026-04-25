import { sql } from "drizzle-orm";
import { describe, expect, test } from "vitest";
import { createPerUserDatabaseClient } from "./create-per-user-database-client";

describe("createPerUserDatabaseClient", () => {
	describe("クライアント生成時", () => {
		test("PRAGMA foreign_keys がONになっていること", async () => {
			const db = await createPerUserDatabaseClient({
				url: ":memory:",
				authToken: "",
			});

			const result = await db.get<{ foreign_keys: number }>(
				sql`PRAGMA foreign_keys`,
			);

			expect(result?.foreign_keys).toBe(1);
		});
	});
});
