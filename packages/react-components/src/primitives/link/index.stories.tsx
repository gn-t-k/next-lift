import type { Meta, StoryObj } from "@storybook/react";
import { Link } from ".";

const meta = {
	title: "UI/Link",
	component: Link,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
} satisfies Meta<typeof Link>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		href: "/programs",
		children: "プログラム一覧",
	},
};

export const Disabled: Story = {
	args: {
		href: "/programs",
		isDisabled: true,
		children: "無効なリンク",
	},
};

export const InText: Story = {
	args: { children: null },
	render: () => (
		<p>
			詳細は<Link href="/help">ヘルプページ</Link>
			をご確認ください。
		</p>
	),
};
