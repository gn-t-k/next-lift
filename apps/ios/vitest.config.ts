import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		passWithNoTests: true,
		setupFiles: ["./src/testing/native-mocks.ts"],
	},
});
