import { type IssueTokenError, issueToken } from "@next-lift/turso/issue-token";
import { R } from "@praha/byethrow";
import {
	DecryptTokenError,
	decrypt,
	EncryptTokenError,
	encrypt,
	getEncryptionKey,
} from "../helpers/crypto";
import {
	type CredentialsNotFoundError,
	type FindCredentialsError,
	findCredentials,
} from "../helpers/find-credentials";
import { type UpdateTokenError, updateToken } from "../helpers/update-token";

export type GetValidCredentialsError =
	| FindCredentialsError
	| DecryptTokenError
	| CredentialsNotFoundError
	| IssueTokenError
	| UpdateTokenError
	| EncryptTokenError;

export const resolveValidCredentials = (
	userId: string,
	now: Date,
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
		R.do(),
		R.bind("record", () => findCredentials(userId)),
		R.bind("credentials", ({ record }) =>
			R.try({
				immediate: true,
				try: () => ({
					dbName: record.dbName,
					url: record.url,
					token: decrypt(record.encryptedToken, getEncryptionKey()),
					expiresAt: record.expiresAt,
				}),
				catch: (error) => new DecryptTokenError({ cause: error }),
			}),
		),
		R.andThen(({ credentials }) => {
			if (now < credentials.expiresAt) {
				return R.succeed(credentials);
			}

			return R.pipe(
				R.do(),
				R.bind("issued", () =>
					issueToken({
						expiresInDays: 30,
						startingFrom: now,
						databaseName: credentials.dbName,
					}),
				),
				R.bind("encryptedToken", ({ issued }) =>
					R.try({
						immediate: true,
						try: () => encrypt(issued.jwt, getEncryptionKey()),
						catch: (error) => new EncryptTokenError({ cause: error }),
					}),
				),
				R.andThrough(({ issued, encryptedToken }) =>
					updateToken({
						userId,
						encryptedToken,
						expiresAt: issued.expiresAt,
					}),
				),
				R.map(({ issued }) => ({
					dbName: credentials.dbName,
					url: credentials.url,
					token: issued.jwt,
					expiresAt: issued.expiresAt,
				})),
			);
		}),
	);
};
