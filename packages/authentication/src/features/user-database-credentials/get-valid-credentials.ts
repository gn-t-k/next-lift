import { type IssueTokenError, issueToken } from "@next-lift/turso/issue-token";
import { R } from "@praha/byethrow";
import {
	type DecryptTokenError,
	type GetUserDatabaseCredentialsError,
	getUserDatabaseCredentials,
	type UserDatabaseCredentialsNotFoundError,
} from "./get-user-database-credentials";
import {
	type EncryptTokenError,
	type RefreshUserDatabaseTokenError,
	refreshUserDatabaseToken,
} from "./refresh-user-database-token";

export type GetValidCredentialsError =
	| GetUserDatabaseCredentialsError
	| DecryptTokenError
	| UserDatabaseCredentialsNotFoundError
	| IssueTokenError
	| RefreshUserDatabaseTokenError
	| EncryptTokenError;

export const getValidCredentials = (
	userId: string,
	now: Date = new Date(),
): R.ResultAsync<
	{
		dbName: string;
		url: string;
		token: string;
		expiresAt: Date;
	},
	GetValidCredentialsError
> => {
	return R.pipe(
		getUserDatabaseCredentials(userId),
		R.andThen((credentials) => {
			const isExpired = now >= credentials.expiresAt;

			if (!isExpired) {
				return R.succeed(credentials);
			}

			return R.pipe(
				issueToken({
					expiresInDays: 30,
					startingFrom: now,
					databaseName: credentials.dbName,
				}),
				R.andThen(({ jwt, expiresAt }) =>
					R.pipe(
						refreshUserDatabaseToken({
							userId,
							token: jwt,
							expiresAt,
						}),
						R.map(() => ({
							dbName: credentials.dbName,
							url: credentials.url,
							token: jwt,
							expiresAt,
						})),
					),
				),
			);
		}),
	);
};
