import type { Meta, StoryObj } from "@storybook/react";
import { MultiToggleButtonGroup } from "./multi-toggle-button-group";
import { ToggleButton } from "./toggle-button";

const meta = {
	title: "UI/MultiToggleButtonGroup",
	component: MultiToggleButtonGroup,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
} satisfies Meta<typeof MultiToggleButtonGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TextDecoration: Story = {
	name: "テキスト装飾（複数選択）",
	render: () => (
		<MultiToggleButtonGroup
			defaultSelectedKeys={["bold", "italic"]}
			className="flex gap-1"
		>
			<ToggleButton id="bold">太字</ToggleButton>
			<ToggleButton id="italic">斜体</ToggleButton>
			<ToggleButton id="underline">下線</ToggleButton>
		</MultiToggleButtonGroup>
	),
};
