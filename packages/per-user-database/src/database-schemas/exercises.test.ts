import path from "node:path";
import { fileURLToPath } from "node:url";
import {
	applyMigrations,
	createDrizzleFromTursoDatabase,
	createTursoDatabaseHandle,
} from "@next-lift/turso-drizzle-adapter";
import { generateId } from "@next-lift/utilities/generate-id";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { exercises, schema } from ".";

const migrationsFolder = path.join(
	path.dirname(fileURLToPath(import.meta.url)),
	"../../drizzle",
);

describe("exercises スキーマ", () => {
	let handle: Awaited<ReturnType<typeof createTursoDatabaseHandle>>;
	let db: ReturnType<typeof createDrizzleFromTursoDatabase<typeof schema>>;

	beforeEach(async () => {
		handle = await createTursoDatabaseHandle(":memory:");
		await applyMigrations(handle, migrationsFolder);
		db = createDrizzleFromTursoDatabase(handle, schema);
	});

	afterEach(async () => {
		await handle.close();
	});

	describe("weight_step を未指定で INSERT したとき", () => {
		test("DEFAULT 値の 2.5 が入ること", async () => {
			await handle
				.prepare("INSERT INTO exercises (id, name) VALUES (?, ?)")
				.run(generateId(), "Squat");

			const [row] = await db.select().from(exercises);

			expect(row?.weightStep).toBe(2.5);
		});
	});

	describe("weight_step に 0 以下の値で INSERT したとき", () => {
		test("CHECK 制約違反でエラーになること", async () => {
			await expect(
				handle
					.prepare(
						"INSERT INTO exercises (id, name, weight_step) VALUES (?, ?, ?)",
					)
					.run(generateId(), "Squat", 0),
			).rejects.toThrow(/CHECK/);
		});
	});
});
