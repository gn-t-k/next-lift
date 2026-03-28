import { R } from "@praha/byethrow";
import { vi } from "vitest";
import type { ApplyMigrationError } from "../apply-migration/apply-migration";
import * as module from "./run-in-per-user-database-scope";

export const mockRunInPerUserDatabaseScopeOk = () => {
	return vi
		.spyOn(module, "runInPerUserDatabaseScope")
		.mockImplementation((_credentials, fn) => Promise.resolve(R.succeed(fn())));
};

export const mockRunInPerUserDatabaseScopeError = (
	error: ApplyMigrationError,
) => {
	return vi
		.spyOn(module, "runInPerUserDatabaseScope")
		.mockResolvedValue(R.fail(error));
};
