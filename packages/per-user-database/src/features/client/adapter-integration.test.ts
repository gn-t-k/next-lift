import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { programs } from "../../database-schemas";
import { factories } from "../../testing/factories";
import { applyMigrations } from "./apply-migrations";
import { createDrizzleFromTursoDatabase } from "./create-drizzle-from-turso-database";
import { createTursoDatabaseHandle } from "./create-turso-database-handle";

describe("新アダプタ経由の統合テスト", () => {
	let handle: Awaited<ReturnType<typeof createTursoDatabaseHandle>>;
	let db: ReturnType<typeof createDrizzleFromTursoDatabase>;

	beforeEach(async () => {
		handle = await createTursoDatabaseHandle(":memory:");
		await applyMigrations(handle);
		db = createDrizzleFromTursoDatabase(handle);
		factories.resetSequence();
	});

	afterEach(async () => {
		await handle.close();
	});

	describe("drizzle-factory 経由でデータを生成したとき", () => {
		test("INSERT 経路でデータが永続すること", async () => {
			const created = await factories(db).programs.create(2);

			const rows = await db.select().from(programs);

			expect(rows).toHaveLength(2);
			expect(rows.map((row) => row.id).sort()).toEqual(
				created.map((row) => row.id).sort(),
			);
		});
	});
});
