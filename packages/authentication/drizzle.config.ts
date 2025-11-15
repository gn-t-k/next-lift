import { tursoEnv } from "@next-lift/env/turso";
import { defineConfig } from "drizzle-kit";

const env = tursoEnv();

export default defineConfig({
	out: "./drizzle",
	schema: "./src/generated/schema.ts",
	dialect: "turso",
	dbCredentials:
		env.DATABASE_PROVIDER === "turso"
			? {
					url: env.TURSO_AUTH_DATABASE_URL,
					authToken: env.TURSO_AUTH_DATABASE_AUTH_TOKEN,
				}
			: {
					url: "file:development-auth.db",
				},
});
