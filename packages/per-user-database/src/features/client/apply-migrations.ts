import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Database } from "@tursodatabase/database";
import { migrate } from "drizzle-orm/sqlite-proxy/migrator";
import { createDatabaseFromTursoDatabase } from "./create-database-from-turso-database";
import { proxyTransaction } from "./proxy-transaction";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsFolder = path.join(__dirname, "../../../drizzle");

export const applyMigrations = async (handle: Database): Promise<void> => {
	await handle.exec("PRAGMA foreign_keys = ON");

	const db = createDatabaseFromTursoDatabase(handle);
	await migrate(
		db,
		async (queries) => {
			await proxyTransaction(handle, async () => {
				for (const query of queries) {
					await handle.exec(query);
				}
			});
		},
		{ migrationsFolder },
	);
};
