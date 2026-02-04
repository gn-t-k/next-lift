import { R } from "@praha/byethrow";
import { vi } from "vitest";

import * as module from "./create-database";

export const mockCreateDatabaseOk = (
	overrides?: Partial<R.InferSuccess<typeof module.createDatabase>>,
) => {
	return vi.spyOn(module, "createDatabase").mockResolvedValue(
		R.succeed({
			id: "mock-db-id",
			hostname: "mock-hostname.turso.io",
			name: "mock-db-name",
			...overrides,
		}),
	);
};

export const mockCreateDatabaseError = (error: module.CreateDatabaseError) => {
	return vi.spyOn(module, "createDatabase").mockResolvedValue(R.fail(error));
};
