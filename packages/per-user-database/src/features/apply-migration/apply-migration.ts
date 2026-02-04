import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@libsql/client";
import { R } from "@praha/byethrow";
import { ErrorFactory } from "@praha/error-factory";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import * as schema from "../../database-schemas";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsFolder = path.join(__dirname, "../../../drizzle");

export class ApplyMigrationError extends ErrorFactory({
	name: "ApplyMigrationError",
	message: "マイグレーションの実行中にエラーが発生しました。",
}) {}

type DatabaseConfig = {
	url: string;
	authToken?: string;
};

export const applyMigration = (
	config: DatabaseConfig,
): R.ResultAsync<void, ApplyMigrationError> =>
	R.try({
		immediate: true,
		try: async () => {
			const client = createClient(
				config.authToken
					? { url: config.url, authToken: config.authToken }
					: { url: config.url },
			);
			const db = drizzle(client, { schema });
			await migrate(db, { migrationsFolder });
		},
		catch: (e) => new ApplyMigrationError({ cause: e }),
	});
