import { R } from "@praha/byethrow";
import { vi } from "vitest";
import * as module from "./save-user-database-credentials";

export const mockSaveUserDatabaseCredentialsOk = () => {
	return vi
		.spyOn(module, "saveUserDatabaseCredentials")
		.mockResolvedValue(R.succeed(undefined));
};

export const mockSaveUserDatabaseCredentialsError = (
	error: module.SaveUserDatabaseCredentialsError | module.EncryptTokenError,
) => {
	return vi
		.spyOn(module, "saveUserDatabaseCredentials")
		.mockResolvedValue(R.fail(error));
};
