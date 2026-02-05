import { deleteDatabase } from "@next-lift/turso/delete-database";
import { R } from "@praha/byethrow";
import { ErrorFactory } from "@praha/error-factory";

export class DestroyAuthDatabaseError extends ErrorFactory({
	name: "DestroyAuthDatabaseError",
	message: "開発用Auth DBの削除中にエラーが発生しました。",
}) {}

export const destroyAuthDatabase = (
	developerName: string,
): R.ResultAsync<void, DestroyAuthDatabaseError> => {
	const databaseName = `next-lift-dev-${developerName}-auth`;

	return R.pipe(
		deleteDatabase(databaseName),
		R.mapError((error) => new DestroyAuthDatabaseError({ cause: error })),
	);
};
