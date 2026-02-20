import {
	type GetValidCredentialsError,
	getValidCredentials,
} from "@next-lift/authentication/user-database-credentials";
import { R } from "@praha/byethrow";

export type { GetValidCredentialsError };

export const getCredentials = (
	userId: string,
): R.ResultAsync<
	{ url: string; authToken: string; expiresAt: string },
	GetValidCredentialsError
> =>
	R.pipe(
		getValidCredentials(userId),
		R.map((credentials) => ({
			url: credentials.url,
			authToken: credentials.token,
			expiresAt: credentials.expiresAt.toISOString(),
		})),
	);
