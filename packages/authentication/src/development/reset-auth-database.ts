import { R } from "@praha/byethrow";
import { ErrorFactory } from "@praha/error-factory";
import { createAuthDatabase } from "./create-auth-database";
import { destroyAuthDatabase } from "./destroy-auth-database";

export class ResetAuthDatabaseError extends ErrorFactory({
	name: "ResetAuthDatabaseError",
	message: "開発用Auth DBのリセット中にエラーが発生しました。",
}) {}

export const resetAuthDatabase = (
	developerName: string,
): R.ResultAsync<
	{ url: string; authToken: string; databaseName: string },
	ResetAuthDatabaseError
> =>
	R.pipe(
		destroyAuthDatabase(developerName),
		R.andThen(() => createAuthDatabase(developerName)),
		R.mapError((error) => new ResetAuthDatabaseError({ cause: error })),
	);
