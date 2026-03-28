import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "../../database-schemas";

export type DatabaseConfig = {
	url: string;
	authToken: string;
};

export const createPerUserDatabaseClient = (config: DatabaseConfig) => {
	const client = createClient({
		url: config.url,
		authToken: config.authToken,
	});

	return drizzle(client, { schema });
};
