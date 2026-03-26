import { env } from "@next-lift/env/private";
import { R } from "@praha/byethrow";
import { ErrorFactory } from "@praha/error-factory";
import { z } from "zod";
import { getFetch } from "../../helpers/fetch-context";

export class DatabaseNotFoundError extends ErrorFactory({
	name: "DatabaseNotFoundError",
	message: "指定されたデータベースが見つかりません。",
}) {}

export class GetDatabaseError extends ErrorFactory({
	name: "GetDatabaseError",
	message: "データベース情報の取得中にエラーが発生しました。",
}) {}

export const getDatabase = async (
	databaseName: string,
): R.ResultAsync<
	{ id: string; hostname: string; name: string },
	DatabaseNotFoundError | GetDatabaseError
> =>
	R.try({
		immediate: true,
		try: async () => {
			const fetchFn = getFetch();
			const apiToken = env.TURSO_PLATFORM_API_TOKEN;
			const organization = env.TURSO_ORGANIZATION;

			const response = await fetchFn(
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
