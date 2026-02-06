import { createDatabase } from "@next-lift/turso/create-database";
import { issueToken } from "@next-lift/turso/issue-token";
import { R } from "@praha/byethrow";
import { ErrorFactory } from "@praha/error-factory";
import { applyAuthMigration } from "./apply-auth-migration";

export class CreateAuthDatabaseError extends ErrorFactory({
	name: "CreateAuthDatabaseError",
	message: "開発用Auth DBの作成中にエラーが発生しました。",
}) {}

export const createAuthDatabase = (
	developerName: string,
): R.ResultAsync<
	{ url: string; authToken: string; databaseName: string },
	CreateAuthDatabaseError
> => {
	const databaseName = generateAuthDatabaseName(developerName);

	return R.pipe(
		R.do(),
		R.bind("createdDatabase", () => createDatabase(databaseName)),
		R.bind("issuedToken", ({ createdDatabase }) =>
			issueToken({
				databaseName: createdDatabase.name,
				expiresInDays: null,
			}),
		),
		R.andThrough(({ createdDatabase, issuedToken: token }) =>
			applyAuthMigration({
				url: `libsql://${createdDatabase.hostname}`,
				authToken: token.jwt,
			}),
		),
		R.map(({ createdDatabase, issuedToken: token }) => ({
			url: `libsql://${createdDatabase.hostname}`,
			authToken: token.jwt,
			databaseName: createdDatabase.name,
		})),
		R.mapError((error) => new CreateAuthDatabaseError({ cause: error })),
	);
};

const generateAuthDatabaseName = (developerName: string) => {
	// Turso DB名は小文字・数字・ハイフンのみ許可
	const sanitized = developerName.toLowerCase().replaceAll("_", "-");

	return `next-lift-development-${sanitized}-auth`;
};
