import { R } from "@praha/byethrow";
import { withAuthenticationDatabase } from "../../../helpers/database-context";
import {
	EncryptTokenError,
	encrypt,
	getEncryptionKey,
} from "../helpers/crypto";
import { type UpdateTokenError, updateToken } from "../helpers/update-token";

export { UpdateTokenError } from "../helpers/update-token";

export const refreshToken = (params: {
	userId: string;
	token: string;
	expiresAt: Date;
}): R.ResultAsync<void, UpdateTokenError | EncryptTokenError> => {
	return R.pipe(
		R.try({
			immediate: true,
			try: () => encrypt(params.token, getEncryptionKey()),
			catch: (error) => new EncryptTokenError({ cause: error }),
		}),
		R.andThen((encryptedToken) =>
			withAuthenticationDatabase(() =>
				updateToken({
					userId: params.userId,
					encryptedToken,
					expiresAt: params.expiresAt,
				}),
			),
		),
	);
};
