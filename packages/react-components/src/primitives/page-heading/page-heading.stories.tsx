import type { Meta, StoryObj } from "@storybook/react";
import { PageHeading } from "./page-heading";

const meta = {
	title: "UI/PageHeading",
	component: PageHeading,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
	argTypes: {
		as: {
			control: "select",
			options: ["h1", "h2", "h3", "h4", "h5", "h6"],
		},
	},
} satisfies Meta<typeof PageHeading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const H1: Story = {
	args: {
		as: "h1",
		children: "プログラム",
	},
};

export const H2: Story = {
	args: {
		as: "h2",
		children: "セクションタイトル",
	},
};

export const AllLevels: Story = {
	args: { as: "h1", children: null },
	render: () => (
		<div className="flex flex-col gap-4">
			<PageHeading as="h1">h1: ページタイトル</PageHeading>
			<PageHeading as="h2">h2: セクションタイトル</PageHeading>
			<PageHeading as="h3">h3: サブセクション</PageHeading>
			<PageHeading as="h4">h4: 小見出し</PageHeading>
			<PageHeading as="h5">h5: より小さい見出し</PageHeading>
			<PageHeading as="h6">h6: 最小の見出し</PageHeading>
		</div>
	),
};
