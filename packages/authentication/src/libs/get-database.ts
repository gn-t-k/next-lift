import { createClient } from "@libsql/client";
import { env } from "@next-lift/env/private";
import { drizzle } from "drizzle-orm/libsql";

export const getDatabase = (type: "file" | "memory" = "file") => {
	const envVars = env();
	const url = envVars.TURSO_AUTH_DATABASE_URL;
	const authToken = envVars.TURSO_AUTH_DATABASE_AUTH_TOKEN;

	const config =
		type === "memory"
			? { url: ":memory:" }
			: url && authToken
				? { url, authToken }
				: { url: "file:development-auth.db" };

	const client = createClient(config);
	return drizzle({ client });
};
