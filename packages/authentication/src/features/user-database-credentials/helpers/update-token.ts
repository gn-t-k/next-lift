import { R } from "@praha/byethrow";
import { ErrorFactory } from "@praha/error-factory";
import { eq, sql } from "drizzle-orm";
import { perUserDatabase } from "../../../database-schemas";
import { getDatabase } from "../../../helpers/database-context";

export class UpdateTokenError extends ErrorFactory({
	name: "UpdateTokenError",
	message: "Per-User Databaseトークンの更新中にエラーが発生しました。",
}) {}

export const updateToken = (params: {
	userId: string;
	encryptedToken: string;
	expiresAt: Date;
}): R.ResultAsync<void, UpdateTokenError> => {
	return R.try({
		immediate: true,
		try: async () => {
			const result = await getDatabase()
				.update(perUserDatabase)
				.set({
					encryptedToken: params.encryptedToken,
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
		catch: (error) => new UpdateTokenError({ cause: error }),
	});
};
