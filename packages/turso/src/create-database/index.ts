import { env } from "@next-lift/env/private";
import { R } from "@praha/byethrow";
import { ErrorFactory } from "@praha/error-factory";
import { z } from "zod";

export class CreateDatabaseError extends ErrorFactory({
	name: "CreateDatabaseError",
	message: "データベースの作成中にエラーが発生しました。",
}) {}

export const createDatabase = async (
	databaseName: string,
): R.ResultAsync<
	{ id: string; hostname: string; name: string },
	CreateDatabaseError
> =>
	R.try({
		immediate: true,
		try: async () => {
			const apiToken = env.TURSO_PLATFORM_API_TOKEN;
			const organization = env.TURSO_ORGANIZATION;

			const response = await fetch(
				`https://api.turso.tech/v1/organizations/${organization}/databases`,
				{
					method: "POST",
					headers: {
						Authorization: `Bearer ${apiToken}`,
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ name: databaseName, group: "default" }),
				},
			);

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(
					`データベースの作成に失敗しました: ${response.status} ${response.statusText} - ${errorText}`,
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
		catch: (error) => new CreateDatabaseError({ cause: error }),
	});
