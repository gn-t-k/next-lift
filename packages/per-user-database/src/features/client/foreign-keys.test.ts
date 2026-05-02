import path from "node:path";
import { fileURLToPath } from "node:url";
import {
	applyMigrations,
	createDrizzleFromTursoDatabase,
	createTursoDatabaseHandle,
} from "@next-lift/turso-drizzle-adapter";
import { generateId } from "@next-lift/utilities/generate-id";
import { eq } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { days, programs, schema } from "../../database-schemas";

const migrationsFolder = path.join(
	path.dirname(fileURLToPath(import.meta.url)),
	"../../../drizzle",
);

// Per-User DB の FK 制約は ON DELETE NO ACTION（=RESTRICT 相当）。Phase 3 の create-per-user-database-client は接続時に PRAGMA foreign_keys = ON を発行するが、ユニットテスト粒度の serverless/compat は HTTP プロトコル前提のためここでは database 経路で同等の挙動を保証する
describe("foreign keys", () => {
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

	describe("PRAGMA foreign_keys = ON のとき", () => {
		test("子レコードを参照中の親 program を DELETE すると FK 違反で失敗すること", async () => {
			const programId = generateId();
			await db.insert(programs).values({ id: programId, name: "p" });
			await db.insert(days).values({
				id: generateId(),
				programId,
				label: "d",
				displayOrder: 0,
			});

			await expect(
				db.delete(programs).where(eq(programs.id, programId)),
			).rejects.toThrow();

			const remaining = await db.select().from(programs);
			expect(remaining).toHaveLength(1);
		});

		test("子レコードを先に DELETE すれば親 program を DELETE できること", async () => {
			const programId = generateId();
			await db.insert(programs).values({ id: programId, name: "p" });
			await db.insert(days).values({
				id: generateId(),
				programId,
				label: "d",
				displayOrder: 0,
			});

			await db.delete(days).where(eq(days.programId, programId));
			await db.delete(programs).where(eq(programs.id, programId));

			const remaining = await db.select().from(programs);
			expect(remaining).toHaveLength(0);
		});
	});
});
