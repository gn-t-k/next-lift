import { vi } from "vitest";
import { createEnvProxy } from "../libs/create-env-proxy";
import type { PublicEnvKey } from "../schema";

const mockOverrides = vi.hoisted<Partial<Record<PublicEnvKey, string>>>(
	() => ({}),
);

vi.mock("@next-lift/env/public", () => ({
	get env() {
		return createEnvProxy(mockOverrides);
	},
}));

export const mockPublicEnv = (
	overrides: Partial<Record<PublicEnvKey, string>> = {},
) => {
	Object.assign(mockOverrides, overrides);
};
