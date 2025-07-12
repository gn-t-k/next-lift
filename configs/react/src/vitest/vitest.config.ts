import { common } from "@configs/common/vitest";
import { defineConfig, mergeConfig } from "vitest/config";

/** @public */
export const react = mergeConfig(
	common,
	defineConfig({
		// nothing
	}),
);
