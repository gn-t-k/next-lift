import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./button";

const meta = {
	title: "UI/Button",
	component: Button,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
	argTypes: {
		intent: {
			control: "select",
			options: ["primary", "secondary", "warning", "danger", "outline", "plain"],
		},
		size: {
			control: "select",
			options: [
				"xs",
				"sm",
				"md",
				"lg",
				"sq-xs",
				"sq-sm",
				"sq-md",
				"sq-lg",
			],
		},
		isCircle: {
			control: "boolean",
		},
		isDisabled: {
			control: "boolean",
		},
	},
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
	args: {
		intent: "primary",
		children: "Primary Button",
	},
};

export const Secondary: Story = {
	args: {
		intent: "secondary",
		children: "Secondary Button",
	},
};

export const Warning: Story = {
	args: {
		intent: "warning",
		children: "Warning Button",
	},
};

export const Danger: Story = {
	args: {
		intent: "danger",
		children: "Danger Button",
	},
};

export const Outline: Story = {
	args: {
		intent: "outline",
		children: "Outline Button",
	},
};

export const Plain: Story = {
	args: {
		intent: "plain",
		children: "Plain Button",
	},
};

export const AllIntents: Story = {
	render: () => (
		<div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
			<Button intent="primary">Primary</Button>
			<Button intent="secondary">Secondary</Button>
			<Button intent="warning">Warning</Button>
			<Button intent="danger">Danger</Button>
			<Button intent="outline">Outline</Button>
			<Button intent="plain">Plain</Button>
		</div>
	),
};

export const AllSizes: Story = {
	render: () => (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				gap: "1rem",
				alignItems: "flex-start",
			}}
		>
			<Button size="xs">Extra Small</Button>
			<Button size="sm">Small</Button>
			<Button size="md">Medium</Button>
			<Button size="lg">Large</Button>
		</div>
	),
};

export const Disabled: Story = {
	args: {
		intent: "primary",
		isDisabled: true,
		children: "Disabled Button",
	},
};
