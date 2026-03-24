import { generateId } from "@next-lift/utilities/generate-id";
import { R } from "@praha/byethrow";
import { ErrorFactory } from "@praha/error-factory";
import { sql } from "drizzle-orm";
import { perUserDatabase } from "../../../database-schemas";
import { getDatabase } from "../../../helpers/database-context";

export class UpsertCredentialsError extends ErrorFactory({
	name: "UpsertCredentialsError",
	message: "Per-User Database情報の保存中にエラーが発生しました。",
}) {}

export const upsertCredentials = (info: {
	userId: string;
	dbName: string;
	url: string;
	encryptedToken: string;
	expiresAt: Date;
}): R.ResultAsync<void, UpsertCredentialsError> => {
	return R.try({
		immediate: true,
		try: async () => {
			await getDatabase()
				.insert(perUserDatabase)
				.values({
					id: generateId(),
					userId: info.userId,
					databaseName: info.dbName,
					databaseUrl: info.url,
					encryptedToken: info.encryptedToken,
					tokenExpiresAt: info.expiresAt,
				})
				.onConflictDoUpdate({
					target: perUserDatabase.userId,
					set: {
						databaseName: info.dbName,
						databaseUrl: info.url,
						encryptedToken: info.encryptedToken,
						tokenExpiresAt: info.expiresAt,
						updatedAt: sql`(cast(unixepoch('subsecond') * 1000 as integer))`,
					},
				});
		},
		catch: (error) => new UpsertCredentialsError({ cause: error }),
	});
};
