import { common } from "@configs/common/vitest";
import { defineConfig, mergeConfig } from "vitest/config";

export const node = mergeConfig(
	common,
	defineConfig({
		test: {
			environment: "node",
		},
	}),
);
