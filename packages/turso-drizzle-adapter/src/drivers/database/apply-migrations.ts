import type { Database } from "@tursodatabase/database";
import { migrate } from "drizzle-orm/sqlite-proxy/migrator";
import { createDatabaseExecutor } from "../../sqlite-proxy/create-database-executor";
import { proxyTransaction } from "../../sqlite-proxy/proxy-transaction";
import { createDrizzleFromTursoDatabase } from "./create-drizzle";

export const applyMigrations = async (
	database: Database,
	migrationsFolder: string,
): Promise<void> => {
	await database.exec("PRAGMA foreign_keys = ON");

	const drizzleDatabase = createDrizzleFromTursoDatabase(database, {});
	const executor = createDatabaseExecutor(database);
	await migrate(
		drizzleDatabase,
		async (queries) => {
			await proxyTransaction(executor, async () => {
				for (const query of queries) {
					await database.exec(query);
				}
			});
		},
		{ migrationsFolder },
	);
};
