import type { R } from "@praha/byethrow";
import { withAuthenticationDatabase } from "../../../helpers/database-context";
import {
	type CredentialsNotFoundOnDeleteError,
	type DeleteCredentialsError,
	removeCredentials,
} from "./remove-credentials";

export {
	CredentialsNotFoundOnDeleteError,
	DeleteCredentialsError,
} from "./remove-credentials";

export const deleteCredentials = (
	userId: string,
): R.ResultAsync<
	void,
	DeleteCredentialsError | CredentialsNotFoundOnDeleteError
> => {
	return withAuthenticationDatabase(() => removeCredentials(userId));
};
