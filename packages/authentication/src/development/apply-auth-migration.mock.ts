import { R } from "@praha/byethrow";
import { vi } from "vitest";

import * as module from "./apply-auth-migration";

export const mockApplyAuthMigrationOk = () => {
	return vi
		.spyOn(module, "applyAuthMigration")
		.mockResolvedValue(R.succeed(undefined));
};

export const mockApplyAuthMigrationError = (
	error: module.ApplyAuthMigrationError,
) => {
	return vi
		.spyOn(module, "applyAuthMigration")
		.mockResolvedValue(R.fail(error));
};
