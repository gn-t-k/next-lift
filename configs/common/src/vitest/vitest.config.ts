import { defineConfig } from "vitest/config";

/** @public */
export const common = defineConfig({
	test: {
		mockReset: true,
		clearMocks: true,
		restoreMocks: true,
	},
});
