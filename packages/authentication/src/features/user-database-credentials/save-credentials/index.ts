import { R } from "@praha/byethrow";
import { withAuthenticationDatabase } from "../../../helpers/database-context";
import {
	EncryptTokenError,
	encrypt,
	getEncryptionKey,
} from "../helpers/crypto";
import {
	type UpsertCredentialsError,
	upsertCredentials,
} from "../helpers/upsert-credentials";

export { EncryptTokenError } from "../helpers/crypto";
export { UpsertCredentialsError } from "../helpers/upsert-credentials";

export const saveCredentials = (info: {
	userId: string;
	dbName: string;
	url: string;
	token: string;
	expiresAt: Date;
}): R.ResultAsync<void, UpsertCredentialsError | EncryptTokenError> => {
	return R.pipe(
		R.try({
			immediate: true,
			try: () => encrypt(info.token, getEncryptionKey()),
			catch: (error) => new EncryptTokenError({ cause: error }),
		}),
		R.andThen((encryptedToken) =>
			withAuthenticationDatabase(() =>
				upsertCredentials({
					...info,
					encryptedToken,
				}),
			),
		),
	);
};
