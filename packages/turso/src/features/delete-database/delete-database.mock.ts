import { R } from "@praha/byethrow";
import { vi } from "vitest";

import * as module from "./delete-database";

export const mockDeleteDatabaseOk = () => {
	return vi
		.spyOn(module, "deleteDatabase")
		.mockResolvedValue(R.succeed(undefined));
};

export const mockDeleteDatabaseError = (error: module.DeleteDatabaseError) => {
	return vi.spyOn(module, "deleteDatabase").mockResolvedValue(R.fail(error));
};
