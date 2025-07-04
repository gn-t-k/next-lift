import { common } from "@configs/common/vitest";
import viteReactPlugin from "@vitejs/plugin-react";
import { defineConfig, mergeConfig } from "vitest/config";

export const react = mergeConfig(
	common,
	defineConfig({
		test: {
			environment: "jsdom",
		},
		plugins: [viteReactPlugin()],
	}),
);
