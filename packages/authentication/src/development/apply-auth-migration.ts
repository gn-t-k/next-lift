import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@libsql/client";
import { R } from "@praha/byethrow";
import { ErrorFactory } from "@praha/error-factory";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import * as schema from "../database-schemas";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsFolder = path.join(__dirname, "../../drizzle");

export class ApplyAuthMigrationError extends ErrorFactory({
	name: "ApplyAuthMigrationError",
	message: "Auth DBマイグレーションの実行中にエラーが発生しました。",
}) {}

export const applyAuthMigration = (config: {
	url: string;
	authToken: string;
}): R.ResultAsync<void, ApplyAuthMigrationError> =>
	R.try({
		immediate: true,
		try: async () => {
			const client = createClient({
				url: config.url,
				authToken: config.authToken,
			});
			const db = drizzle(client, { schema });
			await migrate(db, { migrationsFolder });
		},
		catch: (e) => new ApplyAuthMigrationError({ cause: e }),
	});
