import type { Meta, StoryObj } from "@storybook/react";
import { Heading, HeadingLevel } from "./heading";

const meta = {
	title: "UI/Heading",
	component: Heading,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
	decorators: [
		(Story) => (
			<HeadingLevel>
				<Story />
			</HeadingLevel>
		),
	],
} satisfies Meta<typeof Heading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		children: "プログラム名",
		className: "font-semibold text-2xl",
	},
};

export const Nested: Story = {
	args: { children: "" },
	render: () => (
		<HeadingLevel>
			<div className="flex flex-col gap-2">
				<Heading className="font-semibold text-2xl">h1: プログラム名</Heading>
				<HeadingLevel>
					<Heading className="font-medium text-base">h2: 種目名</Heading>
					<HeadingLevel>
						<Heading className="font-medium text-sm">h3: サブ見出し</Heading>
					</HeadingLevel>
				</HeadingLevel>
			</div>
		</HeadingLevel>
	),
};
