import path from "node:path";
import { fileURLToPath } from "node:url";
import {
	applyMigrations,
	createDrizzleFromTursoDatabase,
	createTursoDatabaseHandle,
} from "@next-lift/turso-drizzle-adapter/database";
import { beforeEach } from "vitest";
import * as schema from "../database-schemas";

const migrationsFolder = path.join(
	path.dirname(fileURLToPath(import.meta.url)),
	"../../drizzle",
);

// :memory: は接続単位で独立する SQLite DB のため、ハンドルをモジュールスコープで保持してテスト間で共有する
const handle = await createTursoDatabaseHandle(":memory:");

export const mockedAuthenticationDatabase = createDrizzleFromTursoDatabase(
	handle,
	schema,
);

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
