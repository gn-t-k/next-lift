import process from "node:process";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

type Props =
	| { type: "remote"; url: string; authToken: string }
	| { type: "file" }
	| { type: "memory" };

export const createDatabase = (props: Props) => {
	const config =
		props.type === "remote"
			? {
					url: props.url,
					authToken: props.authToken,
				}
			: props.type === "file"
				? {
						url: "file:development-auth.db",
					}
				: {
						url: ":memory:",
					};

	const client = createClient(config);
	return drizzle({ client });
};

// biome-ignore lint/complexity/useLiteralKeys: TypeScriptのstrictestルールがブラケット記法を要求するため
const url = process.env["TURSO_AUTH_DATABASE_URL"];
// biome-ignore lint/complexity/useLiteralKeys: TypeScriptのstrictestルールがブラケット記法を要求するため
const authToken = process.env["TURSO_AUTH_DATABASE_AUTH_TOKEN"];

export const database = createDatabase(
	url && authToken ? { type: "remote", url, authToken } : { type: "file" },
);
