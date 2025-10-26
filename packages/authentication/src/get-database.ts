import process from "node:process";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

export const getDatabase = (type: "file" | "memory" = "file") => {
	// biome-ignore lint/complexity/useLiteralKeys: TypeScriptのstrictestルールがブラケット記法を要求するため
	const url = process.env["TURSO_AUTH_DATABASE_URL"];
	// biome-ignore lint/complexity/useLiteralKeys: TypeScriptのstrictestルールがブラケット記法を要求するため
	const authToken = process.env["TURSO_AUTH_DATABASE_AUTH_TOKEN"];

	const config =
		type === "memory"
			? { url: ":memory:" }
			: url && authToken
				? { url, authToken }
				: { url: "file:development-auth.db" };

	const client = createClient(config);
	return drizzle({ client });
};
