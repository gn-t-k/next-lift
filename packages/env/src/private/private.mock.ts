import { vi } from "vitest";
import { createEnvProxy } from "../libs/create-env-proxy";
import type { PrivateEnvKey } from "../schema";

const mockOverrides = vi.hoisted<Partial<Record<PrivateEnvKey, string>>>(
	() => ({}),
);

vi.mock("@next-lift/env/private", () => ({
	get env() {
		return createEnvProxy(mockOverrides);
	},
}));

export const mockPrivateEnv = (
	overrides: Partial<Record<PrivateEnvKey, string>> = {},
) => {
	Object.assign(mockOverrides, overrides);
};
