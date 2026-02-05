import { R } from "@praha/byethrow";
import { ErrorFactory } from "@praha/error-factory";
import { eq, sql } from "drizzle-orm";
import { perUserDatabase } from "../../database-schemas";
import { getDatabase } from "../../helpers/get-database";
import { EncryptTokenError, encrypt, getEncryptionKey } from "./crypto";

export { EncryptTokenError };

export class RefreshUserDatabaseTokenError extends ErrorFactory({
	name: "RefreshUserDatabaseTokenError",
	message: "Per-User Databaseトークンの更新中にエラーが発生しました。",
}) {}

export const refreshUserDatabaseToken = (params: {
	userId: string;
	token: string;
	expiresAt: Date;
}): R.ResultAsync<void, RefreshUserDatabaseTokenError | EncryptTokenError> => {
	return R.pipe(
		R.try({
			immediate: true,
			try: () => encrypt(params.token, getEncryptionKey()),
			catch: (error) => new EncryptTokenError({ cause: error }),
		}),
		R.andThen((encryptedToken) =>
			R.try({
				immediate: true,
				try: async () => {
					const result = await getDatabase()
						.update(perUserDatabase)
						.set({
							encryptedToken,
							tokenExpiresAt: params.expiresAt,
							updatedAt: sql`(cast(unixepoch('subsecond') * 1000 as integer))`,
						})
						.where(eq(perUserDatabase.userId, params.userId));

					if (result.rowsAffected === 0) {
						throw new Error(
							`Per-User Database情報が見つかりません: userId=${params.userId}`,
						);
					}
				},
				catch: (error) => new RefreshUserDatabaseTokenError({ cause: error }),
			}),
		),
	);
};
