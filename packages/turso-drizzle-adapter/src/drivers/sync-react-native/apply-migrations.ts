import type { Database } from "@tursodatabase/sync-react-native";
import { migrate } from "drizzle-orm/sqlite-proxy/migrator";
import { createSyncReactNativeExecutor } from "../../sqlite-proxy/create-sync-react-native-executor";
import { proxyTransaction } from "../../sqlite-proxy/proxy-transaction";
import { createDrizzleFromSyncReactNative } from "./create-drizzle";

export const applyMigrationsToSyncReactNative = async (
	database: Database,
	migrationsFolder: string,
): Promise<void> => {
	await database.exec("PRAGMA foreign_keys = ON");

	const drizzleDatabase = createDrizzleFromSyncReactNative(database, {});
	const executor = createSyncReactNativeExecutor(database);
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
