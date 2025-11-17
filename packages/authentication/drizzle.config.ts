import { env } from "@next-lift/env/private";
import { defineConfig } from "drizzle-kit";

const envVars = env();
const url = envVars.TURSO_AUTH_DATABASE_URL;
const authToken = envVars.TURSO_AUTH_DATABASE_AUTH_TOKEN;

export default defineConfig({
	out: "./drizzle",
	schema: "./src/generated/schema.ts",
	dialect: "turso",
	dbCredentials:
		url && authToken
			? {
					url,
					authToken,
				}
			: {
					url: "file:development-auth.db",
				},
});
