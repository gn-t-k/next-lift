import { R } from "@praha/byethrow";
import { vi } from "vitest";

import * as module from "./destroy-auth-database";

export const mockDestroyAuthDatabaseOk = () => {
	return vi
		.spyOn(module, "destroyAuthDatabase")
		.mockResolvedValue(R.succeed(undefined));
};

export const mockDestroyAuthDatabaseError = (
	error: module.DestroyAuthDatabaseError,
) => {
	return vi
		.spyOn(module, "destroyAuthDatabase")
		.mockResolvedValue(R.fail(error));
};
