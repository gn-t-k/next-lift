import type { Database } from "@tursodatabase/sync-react-native";
import { createSyncReactNativeExecutor } from "../../sqlite-proxy/create-sync-react-native-executor";
import { proxyTransaction } from "../../sqlite-proxy/proxy-transaction";

// drizzle-orm/expo-sqlite/migrator が受け取る形式と同じ。babel-plugin-inline-import で SQL 文字列が import された結果がここに入る
export type SyncReactNativeMigrationConfig = {
	journal: {
		entries: Array<{
			idx: number;
			when: number;
			tag: string;
			breakpoints: boolean;
		}>;
	};
	migrations: Record<string, string>;
};

// drizzle 公式の sqlite-proxy/migrator は Node の fs に依存するため React Native では使えない。expo-sqlite migrator は ExpoSQLiteDatabase 型に縛られるため流用が困難。SQLiteAsyncDialect.migrate と同等のロジックを sync-react-native + sqlite-proxy 上で再現する
export const applyMigrationsToSyncReactNative = async (
	database: Database,
	config: SyncReactNativeMigrationConfig,
): Promise<void> => {
	await database.exec("PRAGMA foreign_keys = ON");

	await database.exec(
		"CREATE TABLE IF NOT EXISTS __drizzle_migrations (id SERIAL PRIMARY KEY, hash text NOT NULL, created_at numeric)",
	);

	const lastApplied = await database.get(
		"SELECT created_at FROM __drizzle_migrations ORDER BY created_at DESC LIMIT 1",
	);
	// SELECT 1 列のみのため Row の Object.values の先頭が created_at 値になる。Row 型の index signature を避けて取り出す
	const lastAppliedValue =
		lastApplied !== undefined ? Object.values(lastApplied)[0] : undefined;
	const lastAppliedMillis =
		typeof lastAppliedValue === "number"
			? lastAppliedValue
			: typeof lastAppliedValue === "string"
				? Number(lastAppliedValue)
				: 0;

	const executor = createSyncReactNativeExecutor(database);
	await proxyTransaction(executor, async () => {
		for (const entry of config.journal.entries) {
			if (entry.when <= lastAppliedMillis) {
				continue;
			}

			const key = `m${entry.idx.toString().padStart(4, "0")}`;
			const sqlString = config.migrations[key];
			if (sqlString === undefined) {
				throw new Error(`Missing migration: ${entry.tag}`);
			}

			for (const stmt of sqlString.split("--> statement-breakpoint")) {
				const trimmed = stmt.trim();
				if (trimmed.length === 0) continue;
				await database.exec(trimmed);
			}

			await database.run(
				"INSERT INTO __drizzle_migrations (hash, created_at) VALUES (?, ?)",
				"",
				entry.when,
			);
		}
	});
};
