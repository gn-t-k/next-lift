import { node } from "@configs/node/vitest";
import { defineConfig, mergeConfig } from "vitest/config";

export const next = mergeConfig(
	node,
	defineConfig({
		// nothing
	}),
);
