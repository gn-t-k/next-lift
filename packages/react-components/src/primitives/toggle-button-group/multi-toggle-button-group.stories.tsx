import type { Meta, StoryObj } from "@storybook/react";
import { type FC, useId } from "react";
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
	render: () => <TextDecorationDemo />,
};

const TextDecorationDemo: FC = () => {
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
