import path from "node:path";
import { fileURLToPath } from "node:url";
import {
	applyMigrations,
	createTursoDatabaseHandle,
} from "@next-lift/turso-drizzle-adapter";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

const migrationsFolder = path.join(
	path.dirname(fileURLToPath(import.meta.url)),
	"../../../drizzle",
);

describe("applyMigrations", () => {
	let handle: Awaited<ReturnType<typeof createTursoDatabaseHandle>>;

	beforeEach(async () => {
		handle = await createTursoDatabaseHandle(":memory:");
	});

	afterEach(async () => {
		await handle.close();
	});

	describe("空 DB に適用したとき", () => {
		test("主要テーブルが作成されること", async () => {
			await applyMigrations(handle, migrationsFolder);

			const rows = await handle
				.prepare(
					"SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' AND name != '__drizzle_migrations'",
				)
				.raw(true)
				.all();
			const tableNames = rows.flat();

			for (const expected of [
				"programs",
				"days",
				"exercises",
				"workouts",
				"exercise_plans",
				"set_plans",
			]) {
				expect(tableNames).toContain(expected);
			}
		});

		test("PRAGMA foreign_keys が ON になっていること", async () => {
			await applyMigrations(handle, migrationsFolder);

			const result = await handle
				.prepare("PRAGMA foreign_keys")
				.raw(true)
				.get();

			expect(result).toEqual([1]);
		});
	});

	describe("既にマイグレーション済みのDBに再適用したとき", () => {
		test("副作用がない（既存データが保持される）こと", async () => {
			await applyMigrations(handle, migrationsFolder);
			await handle
				.prepare("INSERT INTO programs (id, name) VALUES (?, ?)")
				.run("p1", "Program1");

			await applyMigrations(handle, migrationsFolder);

			const rows = await handle.prepare("SELECT id, name FROM programs").all();
			expect(rows).toEqual([{ id: "p1", name: "Program1" }]);
		});
	});
});
