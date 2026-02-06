import { env } from "@next-lift/env/private";
import { R } from "@praha/byethrow";
import { ErrorFactory } from "@praha/error-factory";
import { z } from "zod";

export class ListDatabasesError extends ErrorFactory({
	name: "ListDatabasesError",
	message: "データベース一覧の取得中にエラーが発生しました。",
}) {}

const databaseSchema = z.object({
	name: z.string(),
});

const listDatabasesResponseSchema = z.object({
	databases: z.array(databaseSchema),
});

export type Database = z.infer<typeof databaseSchema>;

export const listDatabases = (): R.ResultAsync<
	Database[],
	ListDatabasesError
> =>
	R.try({
		immediate: true,
		try: async () => {
			const apiToken = env.TURSO_PLATFORM_API_TOKEN;
			const organization = env.TURSO_ORGANIZATION;

			const response = await fetch(
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

			const data = await response.json();
			const parsed = listDatabasesResponseSchema.parse(data);

			return parsed.databases;
		},
		catch: (error) => new ListDatabasesError({ cause: error }),
	});
