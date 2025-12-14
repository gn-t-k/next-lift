import type { StorybookConfig } from "@storybook/react-vite";

export default {
	stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
	addons: [
		"@chromatic-com/storybook",
		"@storybook/addon-docs",
		"@storybook/addon-a11y",
		"@storybook/addon-vitest",
	],
	framework: {
		name: "@storybook/react-vite",
		options: {},
	},
	viteFinal: async (config) => {
		const { default: tailwindcss } = await import("@tailwindcss/vite");
		const { mergeConfig } = await import("vite");
		return mergeConfig(config, { plugins: [tailwindcss()] });
	},
} satisfies StorybookConfig;
