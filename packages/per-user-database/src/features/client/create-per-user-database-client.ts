import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import * as schema from "../../database-schemas";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsFolder = path.join(__dirname, "../../../drizzle");

type DatabaseConfig = {
	url: string;
	authToken?: string;
};

const createDrizzleClient = (config: DatabaseConfig) => {
	const client = createClient(
		config.authToken
			? { url: config.url, authToken: config.authToken }
			: { url: config.url },
	);

	return drizzle(client, { schema });
};

/** DB作成後にスキーマが進化した場合、既存ユーザーのDBに変更を反映する手段が接続時のマイグレーションしかない（Turso Multi-DB Schemasは非推奨。ADR-020参照） */
export const createPerUserDatabaseClient = async (config: DatabaseConfig) => {
	const db = createDrizzleClient(config);
	await migrate(db, { migrationsFolder });
	return db;
};

/** setupPerUserDatabase直後などマイグレーション適用済みが保証されているケースや、テスト環境で使用する */
export const createPerUserDatabaseClientWithoutMigration = (
	config: DatabaseConfig,
) => createDrizzleClient(config);
