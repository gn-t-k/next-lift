import type { Meta, StoryObj } from "@storybook/react";
import { type FC, useId } from "react";
import {
	MultiToggleButtonGroup,
	SingleToggleButtonGroup,
	ToggleButton,
} from ".";

const meta = {
	title: "UI/ToggleButtonGroup",
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const MultiSelectTextDecoration: Story = {
	name: "Multi: テキスト装飾（複数選択）",
	render: () => <MultiTextDecorationDemo />,
};

const MultiTextDecorationDemo: FC = () => {
	const baseId = useId();
	const ids = {
		bold: `${baseId}-bold`,
		italic: `${baseId}-italic`,
		underline: `${baseId}-underline`,
	};
	return (
		<MultiToggleButtonGroup
			defaultSelectedKeys={[ids.bold, ids.italic]}
			className="flex gap-1"
		>
			<ToggleButton id={ids.bold}>太字</ToggleButton>
			<ToggleButton id={ids.italic}>斜体</ToggleButton>
			<ToggleButton id={ids.underline}>下線</ToggleButton>
		</MultiToggleButtonGroup>
	);
};

export const SingleSelectNumberOptions: Story = {
	name: "Single: 数値オプション（RPE 5〜10 の 11 段階）",
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

export const SingleSelectStringOptions: Story = {
	name: "Single: 文字列オプション（テキスト配置）",
	render: () => <SingleStringOptionsDemo />,
};

const SingleStringOptionsDemo: FC = () => {
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

export const SingleSelectNoneSelected: Story = {
	name: "Single: 未選択状態",
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
