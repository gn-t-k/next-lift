import { env } from "@next-lift/env/private";
import {
	createDrizzleFromTursoServerless,
	createTursoServerlessClient,
} from "@next-lift/turso-drizzle-adapter";
import * as schema from "../database-schemas";

export const createDatabaseClient = () => {
	const url = env.TURSO_AUTH_DATABASE_URL;
	const authToken = env.TURSO_AUTH_DATABASE_AUTH_TOKEN;

	const client = createTursoServerlessClient({ url, authToken });
	// ADR-026 に従い接続時に明示的に FK を有効化する。Connection は single-stream で execute が execLock により直列化されるため、await しなくても後続クエリより先に実行される
	client.execute("PRAGMA foreign_keys = ON").catch((error: unknown) => {
		console.error("[authentication] PRAGMA foreign_keys = ON failed", error);
	});
	return createDrizzleFromTursoServerless(client, schema);
};
