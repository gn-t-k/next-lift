import { R } from "@praha/byethrow";
import { vi } from "vitest";
import type { GetValidCredentialsError } from "./get-valid-credentials";
import * as module from "./get-valid-credentials";

export const mockGetValidCredentialsOk = (
	overrides?: Partial<R.InferSuccess<typeof module.getValidCredentials>>,
) => {
	return vi.spyOn(module, "getValidCredentials").mockResolvedValue(
		R.succeed({
			dbName: "mock-per-user-db-name",
			url: "libsql://mock-per-user-db.turso.io",
			token: "mock-valid-token",
			expiresAt: new Date("2026-12-31T00:00:00.000Z"),
			...overrides,
		}),
	);
};

export const mockGetValidCredentialsError = (
	error: GetValidCredentialsError,
) => {
	return vi
		.spyOn(module, "getValidCredentials")
		.mockResolvedValue(R.fail(error));
};
