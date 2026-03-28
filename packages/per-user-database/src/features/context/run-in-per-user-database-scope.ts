import { R } from "@praha/byethrow";
import { withPerUserDatabase } from "../../helpers/database-context";
import { ApplyMigrationError } from "../apply-migration/apply-migration";
import { migrateDatabase } from "../apply-migration/migrate-database";
import { createPerUserDatabaseClient } from "../client/create-per-user-database-client";

// Per-User DBはユーザーごとに独立しているため、スキーマ進化後の既存ユーザーDBに変更を反映する手段はアクセス時のマイグレーションしかない（ADR-020参照）
export const runInPerUserDatabaseScope = <T>(
	credentials: { url: string; authToken: string },
	fn: () => T | Promise<T>,
): R.ResultAsync<Awaited<T>, ApplyMigrationError> => {
	const client = createPerUserDatabaseClient(credentials);
	return R.try({
		immediate: true,
		try: async () => {
			await migrateDatabase(client);
			return await withPerUserDatabase(() => client, fn);
		},
		catch: (e) => new ApplyMigrationError({ cause: e }),
	});
};
