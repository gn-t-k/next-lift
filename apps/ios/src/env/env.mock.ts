import { vi } from "vitest";
import type { IosEnvKey } from "./env";

const mockOverrides = vi.hoisted<Partial<Record<IosEnvKey, string>>>(
	() => ({}),
);

vi.mock("../env/env", () => ({
	get env() {
		return new Proxy({} as Record<IosEnvKey, string>, {
			get(_, prop: string) {
				if (prop in mockOverrides) {
					return mockOverrides[prop as IosEnvKey];
				}
				throw new Error(`環境変数 ${prop} がモックされていません`);
			},
		});
	},
}));

export const mockEnv = (overrides: Partial<Record<IosEnvKey, string>> = {}) => {
	Object.assign(mockOverrides, overrides);
};
