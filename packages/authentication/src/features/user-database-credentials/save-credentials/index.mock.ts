import { R } from "@praha/byethrow";
import { vi } from "vitest";
import type { EncryptTokenError, UpsertCredentialsError } from "./index";
import * as module from "./index";

export const mockSaveCredentialsOk = () => {
	return vi
		.spyOn(module, "saveCredentials")
		.mockResolvedValue(R.succeed(undefined));
};

export const mockSaveCredentialsError = (
	error: UpsertCredentialsError | EncryptTokenError,
) => {
	return vi.spyOn(module, "saveCredentials").mockResolvedValue(R.fail(error));
};
