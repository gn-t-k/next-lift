import type { Meta, StoryObj } from "@storybook/react";
import { ToggleButton, ToggleButtonGroup } from "./toggle-button-group";

const meta = {
	title: "UI/ToggleButtonGroup",
	component: ToggleButtonGroup,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
} satisfies Meta<typeof ToggleButtonGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NumberOptions: Story = {
	name: "数値オプション（RPE 5〜10 の 11 段階）",
	render: () => (
		<ToggleButtonGroup selectionMode="single" defaultSelectedKeys={["8"]}>
			{[5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10].map((value) => (
				<ToggleButton key={value} id={value.toString()}>
					{value}
				</ToggleButton>
			))}
		</ToggleButtonGroup>
	),
};

export const StringOptions: Story = {
	name: "文字列オプション（テキスト配置）",
	render: () => (
		<ToggleButtonGroup selectionMode="single" defaultSelectedKeys={["center"]}>
			<ToggleButton id="left">左</ToggleButton>
			<ToggleButton id="center">中央</ToggleButton>
			<ToggleButton id="right">右</ToggleButton>
		</ToggleButtonGroup>
	),
};

export const MultipleSelection: Story = {
	name: "複数選択モード",
	render: () => (
		<ToggleButtonGroup
			selectionMode="multiple"
			defaultSelectedKeys={["bold", "italic"]}
		>
			<ToggleButton id="bold">太字</ToggleButton>
			<ToggleButton id="italic">斜体</ToggleButton>
			<ToggleButton id="underline">下線</ToggleButton>
		</ToggleButtonGroup>
	),
};

export const NoneSelected: Story = {
	name: "未選択状態",
	render: () => (
		<ToggleButtonGroup selectionMode="single">
			{[5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10].map((value) => (
				<ToggleButton key={value} id={value.toString()}>
					{value}
				</ToggleButton>
			))}
		</ToggleButtonGroup>
	),
};
