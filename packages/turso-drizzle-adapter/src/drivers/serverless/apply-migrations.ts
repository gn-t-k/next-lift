import type { Client } from "@tursodatabase/serverless/compat";
import { migrate } from "drizzle-orm/sqlite-proxy/migrator";
import { createServerlessExecutor } from "../../sqlite-proxy/create-serverless-executor";
import { proxyTransaction } from "../../sqlite-proxy/proxy-transaction";
import { createDrizzleFromTursoServerless } from "./create-drizzle";

export const applyMigrationsToTursoServerless = async (
	client: Client,
	migrationsFolder: string,
): Promise<void> => {
	await client.execute("PRAGMA foreign_keys = ON");

	const drizzleDatabase = createDrizzleFromTursoServerless(client, {});
	const executor = createServerlessExecutor(client);
	await migrate(
		drizzleDatabase,
		async (queries) => {
			await proxyTransaction(executor, async () => {
				for (const query of queries) {
					await client.execute(query);
				}
			});
		},
		{ migrationsFolder },
	);
};
