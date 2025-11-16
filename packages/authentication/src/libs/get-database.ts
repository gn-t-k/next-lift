import process from "node:process";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

export const getDatabase = () => {
	// biome-ignore lint/complexity/useLiteralKeys: TypeScriptのstrictestルールがブラケット記法を要求するため
	const databaseProvider = process.env["DATABASE_PROVIDER"];
	// biome-ignore lint/complexity/useLiteralKeys: TypeScriptのstrictestルールがブラケット記法を要求するため
	const url = process.env["TURSO_AUTH_DATABASE_URL"];
	// biome-ignore lint/complexity/useLiteralKeys: TypeScriptのstrictestルールがブラケット記法を要求するため
	const authToken = process.env["TURSO_AUTH_DATABASE_AUTH_TOKEN"];

	if (databaseProvider === "local") {
		return drizzle({
			client: createClient({ url: "file:development-auth.db" }),
		});
	}

	if (url === undefined || authToken === undefined) {
		throw new Error(
			"TURSO_AUTH_DATABASE_URL or TURSO_AUTH_DATABASE_AUTH_TOKEN is not defined",
		);
	}

	return drizzle({ client: createClient({ url, authToken }) });
};
