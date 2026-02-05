import { R } from "@praha/byethrow";
import { vi } from "vitest";

import * as module from "./apply-migration";

export const mockApplyMigrationOk = () => {
	return vi
		.spyOn(module, "applyMigration")
		.mockResolvedValue(R.succeed(undefined));
};

export const mockApplyMigrationError = (error: module.ApplyMigrationError) => {
	return vi.spyOn(module, "applyMigration").mockResolvedValue(R.fail(error));
};
