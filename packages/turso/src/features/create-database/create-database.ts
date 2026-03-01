import { env } from "@next-lift/env/private";
import { R } from "@praha/byethrow";
import { ErrorFactory } from "@praha/error-factory";
import { z } from "zod";
import {
	DatabaseNotFoundError,
	GetDatabaseError,
	getDatabase,
} from "./get-database";

export { DatabaseNotFoundError, GetDatabaseError };

export class CreateDatabaseError extends ErrorFactory({
	name: "CreateDatabaseError",
	message: "データベースの作成中にエラーが発生しました。",
}) {}

/**
 * データベースを作成する（冪等）
 * すでに同名のデータベースが存在する場合（409）、既存の情報を返す
 */
export const createDatabase = (
	databaseName: string,
): R.ResultAsync<
	{ id: string; hostname: string; name: string },
	CreateDatabaseError | GetDatabaseError | DatabaseNotFoundError
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

			// 409 Conflict: すでに存在する場合、既存の情報を取得して返す
			if (response.status === 409) {
				const existingDb = await getDatabase(databaseName);
				if (R.isFailure(existingDb)) {
					throw existingDb.error;
				}
				return existingDb.value;
			}

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
		catch: (error) => {
			if (
				error instanceof DatabaseNotFoundError ||
				error instanceof GetDatabaseError
			) {
				return error;
			}
			return new CreateDatabaseError({ cause: error });
		},
	});
