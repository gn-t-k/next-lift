import { R } from "@praha/byethrow";
import { withAuthenticationDatabase } from "../../../helpers/database-context";
import {
	DecryptTokenError,
	decrypt,
	getEncryptionKey,
} from "../helpers/crypto";
import {
	type CredentialsNotFoundError,
	type FindCredentialsError,
	findCredentials,
} from "../helpers/find-credentials";

export { DecryptTokenError } from "../helpers/crypto";
export {
	CredentialsNotFoundError,
	FindCredentialsError,
} from "../helpers/find-credentials";

export const getCredentials = (
	userId: string,
): R.ResultAsync<
	{
		dbName: string;
		url: string;
		token: string;
		expiresAt: Date;
	},
	FindCredentialsError | DecryptTokenError | CredentialsNotFoundError
> => {
	return withAuthenticationDatabase(() =>
		R.pipe(
			findCredentials(userId),
			R.andThen((record) =>
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
		),
	);
};
