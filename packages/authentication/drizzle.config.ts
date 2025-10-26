import process from "node:process";
import { defineConfig } from "drizzle-kit";

// biome-ignore lint/complexity/useLiteralKeys: TypeScriptのstrictestルールがブラケット記法を要求するため
const url = process.env["TURSO_AUTH_DATABASE_URL"];
// biome-ignore lint/complexity/useLiteralKeys: TypeScriptのstrictestルールがブラケット記法を要求するため
const authToken = process.env["TURSO_AUTH_DATABASE_AUTH_TOKEN"];

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
