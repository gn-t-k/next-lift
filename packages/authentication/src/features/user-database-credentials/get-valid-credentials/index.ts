import type { R } from "@praha/byethrow";
import { withAuthenticationDatabase } from "../../../helpers/database-context";
import {
	type GetValidCredentialsError,
	resolveValidCredentials,
} from "./resolve-valid-credentials";

export type { GetValidCredentialsError };

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
	return withAuthenticationDatabase(() => resolveValidCredentials(userId, now));
};
