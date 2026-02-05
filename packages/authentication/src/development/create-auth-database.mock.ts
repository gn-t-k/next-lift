import { R } from "@praha/byethrow";
import { vi } from "vitest";

import * as module from "./create-auth-database";

export const mockCreateAuthDatabaseOk = (
	overrides?: Partial<{
		url: string;
		authToken: string;
		databaseName: string;
	}>,
) => {
	return vi.spyOn(module, "createAuthDatabase").mockResolvedValue(
		R.succeed({
			url: "libsql://mock-auth-db.turso.io",
			authToken: "mock-auth-token",
			databaseName: "mock-auth-db",
			...overrides,
		}),
	);
};

export const mockCreateAuthDatabaseError = (
	error: module.CreateAuthDatabaseError,
) => {
	return vi
		.spyOn(module, "createAuthDatabase")
		.mockResolvedValue(R.fail(error));
};
