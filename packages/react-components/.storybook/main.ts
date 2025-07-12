import type { StorybookConfig } from "@storybook/react-vite";

import { dirname, join } from "path";

/**
 * この関数はパッケージの絶対パスを解決するために使用されます。
 * Yarn PnPを使用するプロジェクトやモノレポ内で設定されたプロジェクトで必要です。
 */
type GetAbsolutePath = (value: string) => string;
const getAbsolutePath: GetAbsolutePath = (value) => {
	return dirname(require.resolve(join(value, "package.json")));
};

export default {
	stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
	addons: [
		getAbsolutePath("@storybook/addon-essentials"),
		getAbsolutePath("@storybook/addon-onboarding"),
		getAbsolutePath("@chromatic-com/storybook"),
		getAbsolutePath("@storybook/experimental-addon-test"),
		getAbsolutePath("storybook-dark-mode"),
	],
	framework: {
		name: getAbsolutePath("@storybook/react-vite"),
		options: {},
	},
} satisfies StorybookConfig;
