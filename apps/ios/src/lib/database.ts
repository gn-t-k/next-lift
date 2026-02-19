import { schema } from "@next-lift/per-user-database/database-schemas";
import migrations from "@next-lift/per-user-database/migrations";
import { openSync } from "@op-engineering/op-sqlite";
import { drizzle } from "drizzle-orm/op-sqlite";
import { migrate } from "drizzle-orm/op-sqlite/migrator";
import { resolveCredentials } from "./credentials";

const SYNC_INTERVAL_SECONDS = 60;

export const initializeDatabase = async () => {
	const credentials = await resolveCredentials();

	const sqlite = openSync({
		name: "per-user.sqlite",
		url: credentials.url,
		authToken: credentials.authToken,
		libsqlSyncInterval: SYNC_INTERVAL_SECONDS,
	});

	// リモートDBの状態をローカルに同期してからマイグレーションを実行する
	sqlite.sync();

	const db = drizzle(sqlite, { schema });
	await migrate(db, migrations);

	return { db, sync: () => sqlite.sync() };
};

export type InitializedDatabase = Awaited<
	ReturnType<typeof initializeDatabase>
>;
export type PerUserDatabase = InitializedDatabase["db"];
