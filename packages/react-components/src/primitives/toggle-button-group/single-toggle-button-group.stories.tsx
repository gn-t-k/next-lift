import type { Meta, StoryObj } from "@storybook/react";
import { type FC, useId } from "react";
import { SingleToggleButtonGroup } from "./single-toggle-button-group";
import { ToggleButton } from "./toggle-button";

const meta = {
	title: "UI/SingleToggleButtonGroup",
	component: SingleToggleButtonGroup,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
} satisfies Meta<typeof SingleToggleButtonGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NumberOptions: Story = {
	name: "数値オプション（RPE 5〜10 の 11 段階）",
	render: () => (
		<SingleToggleButtonGroup
			defaultSelectedKey="8"
			className="flex flex-wrap gap-1"
		>
			{[5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10].map((value) => (
				<ToggleButton key={value} id={value.toString()}>
					{value}
				</ToggleButton>
			))}
		</SingleToggleButtonGroup>
	),
};

export const StringOptions: Story = {
	name: "文字列オプション（テキスト配置）",
	render: () => <StringOptionsDemo />,
};

const StringOptionsDemo: FC = () => {
	const baseId = useId();
	const ids = {
		left: `${baseId}-left`,
		center: `${baseId}-center`,
		right: `${baseId}-right`,
	};
	return (
		<SingleToggleButtonGroup
			defaultSelectedKey={ids.center}
			className="flex gap-1"
		>
			<ToggleButton id={ids.left}>左</ToggleButton>
			<ToggleButton id={ids.center}>中央</ToggleButton>
			<ToggleButton id={ids.right}>右</ToggleButton>
		</SingleToggleButtonGroup>
	);
};

export const NoneSelected: Story = {
	name: "未選択状態",
	render: () => (
		<SingleToggleButtonGroup className="flex flex-wrap gap-1">
			{[5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10].map((value) => (
				<ToggleButton key={value} id={value.toString()}>
					{value}
				</ToggleButton>
			))}
		</SingleToggleButtonGroup>
	),
};
