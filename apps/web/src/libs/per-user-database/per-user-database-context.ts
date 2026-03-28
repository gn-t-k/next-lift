import {
	type GetValidCredentialsError,
	getValidCredentials,
} from "@next-lift/authentication/user-database-credentials";
import type { ApplyMigrationError } from "@next-lift/per-user-database/apply-migration";
import { runInPerUserDatabaseScope } from "@next-lift/per-user-database/context";
import { R } from "@praha/byethrow";

export type RunWithPerUserDatabaseError =
	| GetValidCredentialsError
	| ApplyMigrationError;

export const runWithPerUserDatabase = <T>(
	userId: string,
	fn: () => T,
): R.ResultAsync<T, RunWithPerUserDatabaseError> =>
	R.pipe(
		getValidCredentials(userId),
		R.andThen(({ url, token }) =>
			runInPerUserDatabaseScope({ url, authToken: token }, fn),
		),
	);
