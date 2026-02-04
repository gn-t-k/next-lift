import { env } from "@next-lift/env/private";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
	out: "./drizzle",
	schema: "./src/database-schemas/*.ts",
	dialect: "turso",
	dbCredentials: {
		url: env.TURSO_AUTH_DATABASE_URL,
		authToken: env.TURSO_AUTH_DATABASE_AUTH_TOKEN,
	},
});
