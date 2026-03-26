import { env } from "@next-lift/env/private";
import { R } from "@praha/byethrow";
import { ErrorFactory } from "@praha/error-factory";
import { z } from "zod";
import { getFetch } from "../../helpers/fetch-context";

export class ListDatabasesError extends ErrorFactory({
	name: "ListDatabasesError",
	message: "データベース一覧の取得中にエラーが発生しました。",
}) {}

export type Database = { name: string };

export const listDatabases = (): R.ResultAsync<
	Database[],
	ListDatabasesError
> =>
	R.try({
		immediate: true,
		try: async () => {
			const fetchFn = getFetch();
			const apiToken = env.TURSO_PLATFORM_API_TOKEN;
			const organization = env.TURSO_ORGANIZATION;

			const response = await fetchFn(
				`https://api.turso.tech/v1/organizations/${organization}/databases`,
				{
					method: "GET",
					headers: {
						Authorization: `Bearer ${apiToken}`,
					},
				},
			);

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(
					`データベース一覧の取得に失敗しました: ${response.status} ${response.statusText} - ${errorText}`,
				);
			}

			const data = z
				.object({
					databases: z.array(
						z.object({
							Name: z.string(),
						}),
					),
				})
				.parse(await response.json());

			return data.databases.map((db) => ({ name: db.Name }));
		},
		catch: (error) => new ListDatabasesError({ cause: error }),
	});
