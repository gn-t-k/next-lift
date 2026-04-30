import path from "node:path";
import { fileURLToPath } from "node:url";
import {
	applyMigrations,
	createDrizzleFromTursoDatabase,
	createTursoDatabaseHandle,
} from "@next-lift/turso-drizzle-adapter";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { programs, schema } from "../../database-schemas";
import { factories } from "../../testing/factories";

const migrationsFolder = path.join(
	path.dirname(fileURLToPath(import.meta.url)),
	"../../../drizzle",
);

describe("新アダプタ経由の統合テスト", () => {
	let handle: Awaited<ReturnType<typeof createTursoDatabaseHandle>>;
	let db: ReturnType<typeof createDrizzleFromTursoDatabase<typeof schema>>;

	beforeEach(async () => {
		handle = await createTursoDatabaseHandle(":memory:");
		await applyMigrations(handle, migrationsFolder);
		db = createDrizzleFromTursoDatabase(handle, schema);
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
