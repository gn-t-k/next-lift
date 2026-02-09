import { vi } from "vitest";
import { createMockEnv } from "../../helpers/create-mock-env";
import type { PublicEnvKey } from "../../schemas";

const mockOverrides = vi.hoisted<Partial<Record<PublicEnvKey, string>>>(
	() => ({}),
);

vi.mock("@next-lift/env/public", () => ({
	get env() {
		return createMockEnv(mockOverrides);
	},
}));

export const mockPublicEnv = (
	overrides: Partial<Record<PublicEnvKey, string>> = {},
) => {
	Object.assign(mockOverrides, overrides);
};
