import type { Database } from "@tursodatabase/database";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { createTursoDatabaseHandle } from "../drivers/database/create-handle";
import { createDatabaseExecutor } from "./create-database-executor";
import type { SqliteExecutor } from "./executor";
import { proxyTransaction } from "./proxy-transaction";

describe("proxyTransaction", () => {
	let db: Database;
	let executor: SqliteExecutor;

	beforeEach(async () => {
		db = await createTursoDatabaseHandle(":memory:");
		executor = createDatabaseExecutor(db);
		await db.exec(
			"CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT NOT NULL)",
		);
	});

	afterEach(async () => {
		await db.close();
	});

	describe("正常終了したとき", () => {
		test("COMMIT され副作用が確定すること", async () => {
			await proxyTransaction(executor, async () => {
				await db
					.prepare("INSERT INTO users (id, name) VALUES (?, ?)")
					.run(1, "Alice");
			});

			const rows = await db.prepare("SELECT id, name FROM users").all();
			expect(rows).toEqual([{ id: 1, name: "Alice" }]);
		});
	});

	describe("途中でエラーが発生したとき", () => {
		test("ROLLBACK され副作用が残らないこと", async () => {
			await expect(
				proxyTransaction(executor, async () => {
					await db
						.prepare("INSERT INTO users (id, name) VALUES (?, ?)")
						.run(1, "Alice");
					throw new Error("test error");
				}),
			).rejects.toThrow("test error");

			const rows = await db.prepare("SELECT id, name FROM users").all();
			expect(rows).toEqual([]);
		});
	});

	describe("ネストトランザクションで内側がエラーになったとき", () => {
		test("内側のみ巻き戻り、外側は継続できること", async () => {
			await proxyTransaction(executor, async () => {
				await db
					.prepare("INSERT INTO users (id, name) VALUES (?, ?)")
					.run(1, "Outer");

				await expect(
					proxyTransaction(
						executor,
						async () => {
							await db
								.prepare("INSERT INTO users (id, name) VALUES (?, ?)")
								.run(2, "Inner");
							throw new Error("inner error");
						},
						1,
					),
				).rejects.toThrow("inner error");

				await db
					.prepare("INSERT INTO users (id, name) VALUES (?, ?)")
					.run(3, "Outer2");
			});

			const rows = await db
				.prepare("SELECT id, name FROM users ORDER BY id")
				.all();
			expect(rows).toEqual([
				{ id: 1, name: "Outer" },
				{ id: 3, name: "Outer2" },
			]);
		});
	});
});
