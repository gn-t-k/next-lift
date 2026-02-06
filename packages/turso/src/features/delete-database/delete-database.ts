import { env } from "@next-lift/env/private";
import { R } from "@praha/byethrow";
import { ErrorFactory } from "@praha/error-factory";

export class DeleteDatabaseError extends ErrorFactory({
	name: "DeleteDatabaseError",
	message: "データベースの削除中にエラーが発生しました。",
}) {}

export class DatabaseNotFoundError extends ErrorFactory({
	name: "DatabaseNotFoundError",
	message: "指定されたデータベースが見つかりません。",
}) {}

export const deleteDatabase = (
	databaseName: string,
): R.ResultAsync<void, DeleteDatabaseError | DatabaseNotFoundError> =>
	R.try({
		immediate: true,
		try: async () => {
			const apiToken = env.TURSO_PLATFORM_API_TOKEN;
			const organization = env.TURSO_ORGANIZATION;

			const response = await fetch(
				`https://api.turso.tech/v1/organizations/${organization}/databases/${databaseName}`,
				{
					method: "DELETE",
					headers: {
						Authorization: `Bearer ${apiToken}`,
					},
				},
			);

			if (response.status === 404) {
				throw new DatabaseNotFoundError();
			}

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(
					`データベースの削除に失敗しました: ${response.status} ${response.statusText} - ${errorText}`,
				);
			}
		},
		catch: (error) => {
			if (error instanceof DatabaseNotFoundError) {
				return error;
			}
			return new DeleteDatabaseError({ cause: error });
		},
	});
