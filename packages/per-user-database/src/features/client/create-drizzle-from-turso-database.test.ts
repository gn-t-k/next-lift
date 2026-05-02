import path from "node:path";
import { fileURLToPath } from "node:url";
import {
	applyMigrations,
	createDrizzleFromTursoDatabase,
	createTursoDatabaseHandle,
} from "@next-lift/turso-drizzle-adapter";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { programs, schema } from "../../database-schemas";

const migrationsFolder = path.join(
	path.dirname(fileURLToPath(import.meta.url)),
	"../../../drizzle",
);

describe("createDrizzleFromTursoDatabase", () => {
	let handle: Awaited<ReturnType<typeof createTursoDatabaseHandle>>;

	beforeEach(async () => {
		handle = await createTursoDatabaseHandle(":memory:");
		await applyMigrations(handle, migrationsFolder);
	});

	afterEach(async () => {
		await handle.close();
	});

	describe("マイグレーション後のDBから drizzle インスタンスを生成したとき", () => {
		test("スキーマ経由の .select().from(programs) が空配列を返すこと", async () => {
			const db = createDrizzleFromTursoDatabase(handle, schema);

			const rows = await db.select().from(programs);

			expect(rows).toEqual([]);
		});

		test("INSERT 後にスキーマ経由の .select().from(programs) で取得できること", async () => {
			const db = createDrizzleFromTursoDatabase(handle, schema);
			await db.insert(programs).values({ id: "p1", name: "Program1" });

			const rows = await db.select().from(programs);

			expect(rows).toEqual([{ id: "p1", name: "Program1", metaInfo: null }]);
		});
	});
});
