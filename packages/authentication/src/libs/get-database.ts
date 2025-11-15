import { createClient } from "@libsql/client";
import { tursoEnv } from "@next-lift/env/turso";
import { drizzle } from "drizzle-orm/libsql";

export const getDatabase = () => {
	const env = tursoEnv();

	if (env.DATABASE_PROVIDER === "local") {
		return drizzle({
			client: createClient({ url: "file:development-auth.db" }),
		});
	}

	return drizzle({
		client: createClient({
			url: env.TURSO_AUTH_DATABASE_URL,
			authToken: env.TURSO_AUTH_DATABASE_AUTH_TOKEN,
		}),
	});
};
