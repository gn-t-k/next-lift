import type { Meta, StoryObj } from "@storybook/react-vite";
import type { VariantProps } from "class-variance-authority";
import { Button, type buttonVariants } from "./button";

/** @private */
export default {
	component: Button,
} satisfies Meta<typeof Button>;

type Story = StoryObj<typeof Button>;
type StyleVariants = VariantProps<typeof buttonVariants>;

/** @private */
export const Default = {
	args: {
		children: "Button",
	},
	argTypes: {
		variant: {
			control: "select",
			options: [
				"default",
				"destructive",
				"outline",
				"secondary",
				"ghost",
			] satisfies StyleVariants["variant"][],
		},
		size: {
			control: "select",
			options: [
				"default",
				"sm",
				"lg",
				"icon",
			] satisfies StyleVariants["size"][],
		},
	},
} satisfies Story;
