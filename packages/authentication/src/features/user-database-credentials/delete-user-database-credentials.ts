import { R } from "@praha/byethrow";
import { ErrorFactory } from "@praha/error-factory";
import { eq } from "drizzle-orm";
import { perUserDatabase } from "../../database-schemas";
import { getDatabase } from "../../helpers/get-database";

export class DeleteUserDatabaseCredentialsError extends ErrorFactory({
	name: "DeleteUserDatabaseCredentialsError",
	message: "Per-User Database情報の削除中にエラーが発生しました。",
}) {}

export const deleteUserDatabaseCredentials = (
	userId: string,
): R.ResultAsync<void, DeleteUserDatabaseCredentialsError> => {
	return R.try({
		immediate: true,
		try: async () => {
			await getDatabase()
				.delete(perUserDatabase)
				.where(eq(perUserDatabase.userId, userId));
		},
		catch: (error) => new DeleteUserDatabaseCredentialsError({ cause: error }),
	});
};
