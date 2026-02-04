import { R } from "@praha/byethrow";
import { ErrorFactory } from "@praha/error-factory";
import { eq } from "drizzle-orm";
import { perUserDatabase } from "../../database-schemas";
import { getDatabase } from "../../helpers/get-database";
import { DecryptTokenError, decrypt, getEncryptionKey } from "./crypto";

export { DecryptTokenError };

export class GetUserDatabaseCredentialsError extends ErrorFactory({
	name: "GetUserDatabaseCredentialsError",
	message: "Per-User Database情報の取得中にエラーが発生しました。",
}) {}

export class UserDatabaseCredentialsNotFoundError extends ErrorFactory({
	name: "UserDatabaseCredentialsNotFoundError",
	message: "Per-User Database情報が見つかりませんでした。",
}) {}

export const getUserDatabaseCredentials = (
	userId: string,
): R.ResultAsync<
	{
		dbName: string;
		url: string;
		token: string;
		expiresAt: Date;
	},
	| GetUserDatabaseCredentialsError
	| DecryptTokenError
	| UserDatabaseCredentialsNotFoundError
> => {
	return R.pipe(
		R.try({
			immediate: true,
			try: async () => {
				const records = await getDatabase()
					.select()
					.from(perUserDatabase)
					.where(eq(perUserDatabase.userId, userId));

				return records[0] ?? null;
			},
			catch: (error) => new GetUserDatabaseCredentialsError({ cause: error }),
		}),
		R.andThen((record) => {
			if (record === null) {
				return R.fail(new UserDatabaseCredentialsNotFoundError());
			}

			return R.try({
				immediate: true,
				try: () => ({
					dbName: record.databaseName,
					url: record.databaseUrl,
					token: decrypt(record.encryptedToken, getEncryptionKey()),
					expiresAt: record.tokenExpiresAt,
				}),
				catch: (error) => new DecryptTokenError({ cause: error }),
			});
		}),
	);
};
