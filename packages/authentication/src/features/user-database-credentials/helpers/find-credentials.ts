import { R } from "@praha/byethrow";
import { ErrorFactory } from "@praha/error-factory";
import { eq } from "drizzle-orm";
import { perUserDatabase } from "../../../database-schemas";
import { getDatabase } from "../../../helpers/database-context";

export class FindCredentialsError extends ErrorFactory({
	name: "FindCredentialsError",
	message: "Per-User Database情報の取得中にエラーが発生しました。",
}) {}

export class CredentialsNotFoundError extends ErrorFactory({
	name: "CredentialsNotFoundError",
	message: "Per-User Database情報が見つかりませんでした。",
}) {}

export const findCredentials = (
	userId: string,
): R.ResultAsync<
	{
		dbName: string;
		url: string;
		encryptedToken: string;
		expiresAt: Date;
	},
	FindCredentialsError | CredentialsNotFoundError
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
			catch: (error) => new FindCredentialsError({ cause: error }),
		}),
		R.andThen((record) => {
			if (record === null) {
				return R.fail(new CredentialsNotFoundError());
			}

			return R.succeed({
				dbName: record.databaseName,
				url: record.databaseUrl,
				encryptedToken: record.encryptedToken,
				expiresAt: record.tokenExpiresAt,
			});
		}),
	);
};
