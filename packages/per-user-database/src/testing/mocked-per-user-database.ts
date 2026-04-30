import path from "node:path";
import { fileURLToPath } from "node:url";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import { beforeEach } from "vitest";
import * as schema from "../database-schemas";
import { applyMigrations } from "../features/client/apply-migrations";
import { createDrizzleFromTursoDatabase } from "../features/client/create-drizzle-from-turso-database";
import { createTursoDatabaseHandle } from "../features/client/create-turso-database-handle";

const migrationsFolder = path.join(
	path.dirname(fileURLToPath(import.meta.url)),
	"../../drizzle",
);

// :memory: は接続単位で独立する SQLite DB のため、ハンドルをモジュールスコープで保持してテスト間で共有する
const handle = await createTursoDatabaseHandle(":memory:");

// 本番経路は Phase 3 まで `LibSQLDatabase` を context 型として保持する。Phase 2 のテスト経路はバックを sqlite-proxy に切り替えたが、context 型に合わせるためここで寄せる。Phase 3 で context 型自体が sqlite-proxy 系に切り替わったら不要になる
export const mockedPerUserDatabase = createDrizzleFromTursoDatabase(
	handle,
	schema,
) as unknown as LibSQLDatabase<typeof schema>;

beforeEach(async () => {
	await dropAllTables();
	await applyMigrations(handle, migrationsFolder);
});

const dropAllTables = async () => {
	await handle.exec("PRAGMA foreign_keys = OFF");

	const rows = await handle
		.prepare(
			"SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'",
		)
		.all();

	for (const row of rows) {
		const { name } = row as { name: string };
		await handle.exec(`DROP TABLE IF EXISTS "${name}"`);
	}

	await handle.exec("PRAGMA foreign_keys = ON");
};
