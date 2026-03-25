import { createClient } from "@libsql/client";
import { env } from "@next-lift/env/private";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "../database-schemas";

export const createDatabaseClient = () => {
	const url = env.TURSO_AUTH_DATABASE_URL;
	const authToken = env.TURSO_AUTH_DATABASE_AUTH_TOKEN;

	return drizzle({
		client: createClient({ url, authToken }),
		schema,
	});
};
