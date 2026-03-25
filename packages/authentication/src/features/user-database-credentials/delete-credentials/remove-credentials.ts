import { R } from "@praha/byethrow";
import { ErrorFactory } from "@praha/error-factory";
import { eq } from "drizzle-orm";
import { perUserDatabase } from "../../../database-schemas";
import { getDatabase } from "../../../helpers/database-context";

export class DeleteCredentialsError extends ErrorFactory({
	name: "DeleteCredentialsError",
	message: "Per-User Database情報の削除中にエラーが発生しました。",
}) {}

export class CredentialsNotFoundOnDeleteError extends ErrorFactory({
	name: "CredentialsNotFoundOnDeleteError",
	message: "削除対象のPer-User Database情報が見つかりませんでした。",
}) {}

export const removeCredentials = (
	userId: string,
): R.ResultAsync<
	void,
	DeleteCredentialsError | CredentialsNotFoundOnDeleteError
> => {
	return R.try({
		immediate: true,
		try: async () => {
			const result = await getDatabase()
				.delete(perUserDatabase)
				.where(eq(perUserDatabase.userId, userId));

			if (result.rowsAffected === 0) {
				throw new CredentialsNotFoundOnDeleteError();
			}
		},
		catch: (error) => {
			if (error instanceof CredentialsNotFoundOnDeleteError) {
				return error;
			}
			return new DeleteCredentialsError({ cause: error });
		},
	});
};
