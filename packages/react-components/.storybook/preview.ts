import type { Preview } from "@storybook/react-vite";
import "../src/globals.css";

/** @private */
export default {
	parameters: {
		darkMode: {
			stylePreview: true,
		},
	},
} satisfies Preview;
