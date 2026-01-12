import { R } from "@praha/byethrow";
import { vi } from "vitest";

import * as module from "./index";

export const mockIssueTokenOk = (
	overrides?: Partial<R.InferSuccess<typeof module.issueToken>>,
) => {
	return vi.spyOn(module, "issueToken").mockResolvedValue(
		R.succeed({
			jwt: "mock-jwt-token",
			expiresAt: new Date(),
			...overrides,
		}),
	);
};

export const mockIssueTokenError = (error: module.IssueTokenError) => {
	return vi.spyOn(module, "issueToken").mockResolvedValue(R.fail(error));
};
