import { R } from "@praha/byethrow";
import { ErrorFactory } from "@praha/error-factory";
import {
	createPerUserDatabaseClient,
	type DatabaseConfig,
} from "../client/create-per-user-database-client";
import { migrateDatabase } from "./migrate-database";

export class ApplyMigrationError extends ErrorFactory({
	name: "ApplyMigrationError",
	message: "マイグレーションの実行中にエラーが発生しました。",
}) {}

export const applyMigration = (
	config: DatabaseConfig,
): R.ResultAsync<void, ApplyMigrationError> =>
	R.try({
		immediate: true,
		try: async () => {
			const db = await createPerUserDatabaseClient(config);
			await migrateDatabase(db);
		},
		catch: (e) => new ApplyMigrationError({ cause: e }),
	});
