import { R } from "@praha/byethrow";
import { ErrorFactory } from "@praha/error-factory";

export class DeleteDatabaseError extends ErrorFactory({
	name: "DeleteDatabaseError",
	message: "データベースの削除中にエラーが発生しました。",
}) {}

export const deleteDatabase = async (
	databaseName: string,
	credentials: { apiToken: string; organization: string },
): R.ResultAsync<void, DeleteDatabaseError> =>
	R.try({
		immediate: true,
		try: async () => {
			const { apiToken, organization } = credentials;

			const response = await fetch(
				`https://api.turso.tech/v1/organizations/${organization}/databases/${databaseName}`,
				{
					method: "DELETE",
					headers: {
						Authorization: `Bearer ${apiToken}`,
					},
				},
			);

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(
					`データベースの削除に失敗しました: ${response.status} ${response.statusText} - ${errorText}`,
				);
			}
		},
		catch: (error) => new DeleteDatabaseError({ cause: error }),
	});
