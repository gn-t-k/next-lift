import process from "node:process";
import { defineConfig } from "drizzle-kit";

// biome-ignore lint/complexity/useLiteralKeys: TypeScriptのstrictestルールがブラケット記法を要求するため
const databaseProvider = process.env["DATABASE_PROVIDER"];
// biome-ignore lint/complexity/useLiteralKeys: TypeScriptのstrictestルールがブラケット記法を要求するため
const url = process.env["TURSO_AUTH_DATABASE_URL"];
// biome-ignore lint/complexity/useLiteralKeys: TypeScriptのstrictestルールがブラケット記法を要求するため
const authToken = process.env["TURSO_AUTH_DATABASE_AUTH_TOKEN"];

const getDbCredentials = () => {
	if (databaseProvider === "local") {
		return { url: "file:development-auth.db" };
	}

	if (url === undefined || authToken === undefined) {
		throw new Error(
			"TURSO_AUTH_DATABASE_URL or TURSO_AUTH_DATABASE_AUTH_TOKEN is not defined",
		);
	}

	return { url, authToken };
};

export default defineConfig({
	out: "./drizzle",
	schema: "./src/generated/schema.ts",
	dialect: "turso",
	dbCredentials: getDbCredentials(),
});
