import type { Database } from "@tursodatabase/database";
import { migrate } from "drizzle-orm/sqlite-proxy/migrator";
import { createDrizzleFromTursoDatabase } from "./create-drizzle-from-turso-database";
import { proxyTransaction } from "./proxy-transaction";

export const applyMigrations = async (
	database: Database,
	migrationsFolder: string,
): Promise<void> => {
	await database.exec("PRAGMA foreign_keys = ON");

	const drizzleDatabase = createDrizzleFromTursoDatabase(database, {});
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
