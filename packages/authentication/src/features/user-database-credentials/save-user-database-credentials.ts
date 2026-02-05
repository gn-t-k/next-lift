import { generateId } from "@next-lift/utilities/generate-id";
import { R } from "@praha/byethrow";
import { ErrorFactory } from "@praha/error-factory";
import { sql } from "drizzle-orm";
import { perUserDatabase } from "../../database-schemas";
import { getDatabase } from "../../helpers/get-database";
import { EncryptTokenError, encrypt, getEncryptionKey } from "./crypto";

export { EncryptTokenError };

export class SaveUserDatabaseCredentialsError extends ErrorFactory({
	name: "SaveUserDatabaseCredentialsError",
	message: "Per-User Database情報の保存中にエラーが発生しました。",
}) {}

/**
 * Per-User Database情報を保存する（冪等）
 * サインアップ処理のリトライ時に重複エラーが発生しないよう、UPSERT で保存する
 */
export const saveUserDatabaseCredentials = (info: {
	userId: string;
	dbName: string;
	url: string;
	token: string;
	expiresAt: Date;
}): R.ResultAsync<
	void,
	SaveUserDatabaseCredentialsError | EncryptTokenError
> => {
	return R.pipe(
		R.try({
			immediate: true,
			try: () => encrypt(info.token, getEncryptionKey()),
			catch: (error) => new EncryptTokenError({ cause: error }),
		}),
		R.andThen((encryptedToken) =>
			R.try({
				immediate: true,
				try: async () => {
					await getDatabase()
						.insert(perUserDatabase)
						.values({
							id: generateId(),
							userId: info.userId,
							databaseName: info.dbName,
							databaseUrl: info.url,
							encryptedToken,
							tokenExpiresAt: info.expiresAt,
						})
						.onConflictDoUpdate({
							target: perUserDatabase.userId,
							set: {
								databaseName: info.dbName,
								databaseUrl: info.url,
								encryptedToken,
								tokenExpiresAt: info.expiresAt,
								updatedAt: sql`(cast(unixepoch('subsecond') * 1000 as integer))`,
							},
						});
				},
				catch: (error) =>
					new SaveUserDatabaseCredentialsError({ cause: error }),
			}),
		),
	);
};
