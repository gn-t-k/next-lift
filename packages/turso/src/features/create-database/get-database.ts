import { R } from "@praha/byethrow";
import { ErrorFactory } from "@praha/error-factory";
import { z } from "zod";

export class DatabaseNotFoundError extends ErrorFactory({
	name: "DatabaseNotFoundError",
	message: "指定されたデータベースが見つかりません。",
}) {}

export class GetDatabaseError extends ErrorFactory({
	name: "GetDatabaseError",
	message: "データベース情報の取得中にエラーが発生しました。",
}) {}

/**
 * 既存のデータベース情報を取得する（内部関数）
 * create-database の冪等化のために使用
 */
export const getDatabase = async (
	databaseName: string,
	credentials: { apiToken: string; organization: string },
): R.ResultAsync<
	{ id: string; hostname: string; name: string },
	DatabaseNotFoundError | GetDatabaseError
> =>
	R.try({
		immediate: true,
		try: async () => {
			const { apiToken, organization } = credentials;

			const response = await fetch(
				`https://api.turso.tech/v1/organizations/${organization}/databases/${databaseName}`,
				{
					method: "GET",
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
					`データベース情報の取得に失敗しました: ${response.status} ${response.statusText} - ${errorText}`,
				);
			}

			const data = z
				.object({
					database: z.object({
						DbId: z.string(),
						Hostname: z.string(),
						Name: z.string(),
					}),
				})
				.parse(await response.json());

			return {
				id: data.database.DbId,
				hostname: data.database.Hostname,
				name: data.database.Name,
			};
		},
		catch: (error) => {
			if (error instanceof DatabaseNotFoundError) {
				return error;
			}
			return new GetDatabaseError({ cause: error });
		},
	});
