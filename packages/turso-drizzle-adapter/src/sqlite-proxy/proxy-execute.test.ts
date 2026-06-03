import type { Database } from "@tursodatabase/database";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { createTursoDatabaseHandle } from "../drivers/database/create-handle";
import { createDatabaseExecutor } from "./create-database-executor";
import type { SqliteExecutor } from "./executor";
import { proxyExecute } from "./proxy-execute";

describe("proxyExecute", () => {
	let db: Database;
	let executor: SqliteExecutor;

	beforeEach(async () => {
		db = await createTursoDatabaseHandle(":memory:");
		executor = createDatabaseExecutor(db);
		await db.exec(
			"CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT NOT NULL, age INTEGER)",
		);
		await db
			.prepare("INSERT INTO users (id, name, age) VALUES (?, ?, ?)")
			.run(1, "Alice", 30);
		await db
			.prepare("INSERT INTO users (id, name, age) VALUES (?, ?, ?)")
			.run(2, "Bob", 25);
	});

	afterEach(async () => {
		await db.close();
	});

	describe("method が 'all' のとき", () => {
		test("複数行が rows: any[][] 形式で返ること", async () => {
			const result = await proxyExecute(
				executor,
				"SELECT id, name, age FROM users ORDER BY id",
				[],
				"all",
			);

			expect(result).toEqual({
				rows: [
					[1, "Alice", 30],
					[2, "Bob", 25],
				],
			});
		});
	});

	describe("method が 'values' のとき", () => {
		test("複数行が rows: any[][] 形式で返ること", async () => {
			const result = await proxyExecute(
				executor,
				"SELECT id, name FROM users ORDER BY id",
				[],
				"values",
			);

			expect(result).toEqual({
				rows: [
					[1, "Alice"],
					[2, "Bob"],
				],
			});
		});
	});

	describe("method が 'get' のとき", () => {
		test("単一行がカラム値の配列として返ること", async () => {
			const result = await proxyExecute(
				executor,
				"SELECT id, name, age FROM users WHERE id = ?",
				[1],
				"get",
			);

			expect(result).toEqual({ rows: [1, "Alice", 30] });
		});

		test("該当行がないとき rows が空配列になること", async () => {
			const result = await proxyExecute(
				executor,
				"SELECT id, name FROM users WHERE id = ?",
				[999],
				"get",
			);

			expect(result).toEqual({ rows: [] });
		});
	});

	describe("method が 'run' のとき", () => {
		test("INSERT で rowsAffected と lastInsertRowid が返ること", async () => {
			const result = await proxyExecute(
				executor,
				"INSERT INTO users (id, name, age) VALUES (?, ?, ?)",
				[3, "Carol", 28],
				"run",
			);

			expect(result).toEqual({
				rows: [],
				rowsAffected: 1,
				lastInsertRowid: 3,
			});

			const inserted = await db
				.prepare("SELECT name FROM users WHERE id = ?")
				.get(3);
			expect(inserted).toEqual({ name: "Carol" });
		});

		test("UPDATE で該当行が無い場合は rowsAffected が 0 になること", async () => {
			const result = await proxyExecute(
				executor,
				"UPDATE users SET name = ? WHERE id = ?",
				["NotExist", 999],
				"run",
			);

			expect(result.rowsAffected).toBe(0);
		});

		test("UPDATE で該当行が有る場合は rowsAffected が変更行数になること", async () => {
			const result = await proxyExecute(
				executor,
				"UPDATE users SET name = ? WHERE id = ?",
				["Renamed", 1],
				"run",
			);

			expect(result.rowsAffected).toBe(1);
		});
	});

	describe("パラメータバインディングのとき", () => {
		test("? プレースホルダが正しく置換されること", async () => {
			const result = await proxyExecute(
				executor,
				"SELECT id FROM users WHERE name = ? AND age = ?",
				["Alice", 30],
				"all",
			);

			expect(result).toEqual({ rows: [[1]] });
		});
	});
});
