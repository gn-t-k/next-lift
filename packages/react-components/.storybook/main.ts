import { dirname, join } from "node:path";
import type { StorybookConfig } from "@storybook/react-vite";

/**
 * この関数はパッケージの絶対パスを解決するために使用されます。
 * Yarn PnPを使用するプロジェクトやモノレポ内で設定されたプロジェクトで必要です。
 */
type GetAbsolutePath = (value: string) => string;
const getAbsolutePath: GetAbsolutePath = (value) => {
	return dirname(require.resolve(join(value, "package.json")));
};

/** @private */
export default {
	stories: ["../src/**/*.stories.tsx"],
	addons: [
		getAbsolutePath("@chromatic-com/storybook"),
		getAbsolutePath("@storybook/addon-docs"),
		getAbsolutePath("@storybook/addon-a11y"),
		getAbsolutePath("@storybook/addon-vitest"),
		getAbsolutePath("storybook-dark-mode"),
	],
	framework: {
		name: getAbsolutePath("@storybook/react-vite"),
		options: {},
	},
} satisfies StorybookConfig;
