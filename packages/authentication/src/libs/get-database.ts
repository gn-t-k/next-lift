import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { getDatabaseConfig } from "./get-database-config";

export const getDatabase = () => {
	const dbConfig = getDatabaseConfig();

	const config =
		dbConfig.type === "turso"
			? { url: dbConfig.url, authToken: dbConfig.authToken }
			: { url: dbConfig.path };

	const client = createClient(config);
	return drizzle({ client });
};

export const getTestDatabase = () => {
	const client = createClient({ url: ":memory:" });
	return drizzle({ client });
};
