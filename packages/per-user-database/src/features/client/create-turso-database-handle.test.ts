import { describe, expect, test } from "vitest";
import { createTursoDatabaseHandle } from "./create-turso-database-handle";

describe("createTursoDatabaseHandle", () => {
	describe("インメモリDBへ接続したとき", () => {
		test("CREATE TABLE → INSERT → SELECT が一連で成功すること", async () => {
			const db = await createTursoDatabaseHandle(":memory:");

			await db.exec(
				"CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT NOT NULL)",
			);
			await db
				.prepare("INSERT INTO users (id, name) VALUES (?, ?)")
				.run(1, "Alice");
			const rows = await db.prepare("SELECT id, name FROM users").all();

			expect(rows).toEqual([{ id: 1, name: "Alice" }]);

			await db.close();
		});
	});

	describe("PRAGMA foreign_keys = ON を実行したとき", () => {
		test("FK 制約違反で書き込みが失敗すること", async () => {
			const db = await createTursoDatabaseHandle(":memory:");
			await db.exec("PRAGMA foreign_keys = ON");
			await db.exec(
				"CREATE TABLE parents (id INTEGER PRIMARY KEY); CREATE TABLE children (id INTEGER PRIMARY KEY, parent_id INTEGER NOT NULL REFERENCES parents(id))",
			);

			await expect(
				db
					.prepare("INSERT INTO children (id, parent_id) VALUES (?, ?)")
					.run(1, 999),
			).rejects.toThrow();

			await db.close();
		});
	});
});
