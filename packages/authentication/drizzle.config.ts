import { defineConfig } from "drizzle-kit";
import { getDatabaseConfig } from "./src/libs/get-database-config";

const dbConfig = getDatabaseConfig();

const dbCredentials =
	dbConfig.type === "turso"
		? {
				url: dbConfig.url,
				authToken: dbConfig.authToken,
			}
		: {
				url: dbConfig.path,
			};

export default defineConfig({
	out: "./drizzle",
	schema: "./src/generated/schema.ts",
	dialect: "turso",
	dbCredentials,
});
