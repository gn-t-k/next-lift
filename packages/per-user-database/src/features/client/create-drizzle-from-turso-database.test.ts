import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { programs } from "../../database-schemas";
import { applyMigrations } from "./apply-migrations";
import { createDrizzleFromTursoDatabase } from "./create-drizzle-from-turso-database";
import { createTursoDatabaseHandle } from "./create-turso-database-handle";

describe("createDrizzleFromTursoDatabase", () => {
	let handle: Awaited<ReturnType<typeof createTursoDatabaseHandle>>;

	beforeEach(async () => {
		handle = await createTursoDatabaseHandle(":memory:");
		await applyMigrations(handle);
	});

	afterEach(async () => {
		await handle.close();
	});

	describe("マイグレーション後のDBから drizzle インスタンスを生成したとき", () => {
		test("スキーマ経由の .select().from(programs) が空配列を返すこと", async () => {
			const db = createDrizzleFromTursoDatabase(handle);

			const rows = await db.select().from(programs);

			expect(rows).toEqual([]);
		});

		test("INSERT 後にスキーマ経由の .select().from(programs) で取得できること", async () => {
			const db = createDrizzleFromTursoDatabase(handle);
			await db.insert(programs).values({ id: "p1", name: "Program1" });

			const rows = await db.select().from(programs);

			expect(rows).toEqual([{ id: "p1", name: "Program1", metaInfo: null }]);
		});
	});
});
