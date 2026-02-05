import { R } from "@praha/byethrow";
import { vi } from "vitest";

import * as module from "./create-turso-per-user-database";

export const mockCreateTursoPerUserDatabaseOk = (
	overrides?: Partial<R.InferSuccess<typeof module.createTursoPerUserDatabase>>,
) => {
	return vi.spyOn(module, "createTursoPerUserDatabase").mockResolvedValue(
		R.succeed({
			name: "mock-per-user-db-name",
			url: "libsql://mock-per-user-db.turso.io",
			authToken: "mock-auth-token",
			expiresAt: new Date(),
			...overrides,
		}),
	);
};

export const mockCreateTursoPerUserDatabaseError = (
	error: module.CreateTursoPerUserDatabaseError,
) => {
	return vi
		.spyOn(module, "createTursoPerUserDatabase")
		.mockResolvedValue(R.fail(error));
};
