import { R } from "@praha/byethrow";
import { vi } from "vitest";

import type { Database } from "./list-databases";
import * as module from "./list-databases";

export const mockListDatabasesOk = (overrides?: Database[]) => {
	return vi
		.spyOn(module, "listDatabases")
		.mockResolvedValue(R.succeed(overrides ?? []));
};

export const mockListDatabasesError = (error: module.ListDatabasesError) => {
	return vi.spyOn(module, "listDatabases").mockResolvedValue(R.fail(error));
};
