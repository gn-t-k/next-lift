import {
	createDrizzleFromTursoServerless,
	createTursoServerlessClient,
} from "@next-lift/turso-drizzle-adapter";
import type { Client } from "@tursodatabase/serverless/compat";
import * as schema from "../../database-schemas";

export type DatabaseConfig = {
	url: string;
	authToken: string;
};

export type PerUserDatabaseClient = {
	db: ReturnType<typeof createDrizzleFromTursoServerless<typeof schema>>;
	client: Client;
};

// libSQL は SQLITE_DEFAULT_FOREIGN_KEYS=1 でビルドされていたが、@tursodatabase/serverless では PRAGMA を明示的に発行する。FK制約方針は ADR-026
export const createPerUserDatabaseClient = async (
	config: DatabaseConfig,
): Promise<PerUserDatabaseClient> => {
	const client = createTursoServerlessClient({
		url: config.url,
		authToken: config.authToken,
	});
	await client.execute("PRAGMA foreign_keys = ON");
	const db = createDrizzleFromTursoServerless(client, schema);
	return { db, client };
};
