import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Database } from "@tursodatabase/database";
import { migrate } from "drizzle-orm/sqlite-proxy/migrator";
import { createDrizzleFromTursoDatabase } from "./create-drizzle-from-turso-database";
import { proxyTransaction } from "./proxy-transaction";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsFolder = path.join(__dirname, "../../../drizzle");

export const applyMigrations = async (database: Database): Promise<void> => {
	await database.exec("PRAGMA foreign_keys = ON");

	const drizzleDatabase = createDrizzleFromTursoDatabase(database);
	await migrate(
		drizzleDatabase,
		async (queries) => {
			await proxyTransaction(database, async () => {
				for (const query of queries) {
					await database.exec(query);
				}
			});
		},
		{ migrationsFolder },
	);
};
