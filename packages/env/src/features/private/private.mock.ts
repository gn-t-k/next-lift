import { vi } from "vitest";
import { createMockEnv } from "../../helpers/create-mock-env";
import type { PrivateEnvKey } from "../../schemas";

const mockOverrides = vi.hoisted<Partial<Record<PrivateEnvKey, string>>>(
	() => ({}),
);

vi.mock("@next-lift/env/private", () => ({
	get env() {
		return createMockEnv(mockOverrides);
	},
}));

export const mockPrivateEnv = (
	overrides: Partial<Record<PrivateEnvKey, string>> = {},
) => {
	Object.assign(mockOverrides, overrides);
};
