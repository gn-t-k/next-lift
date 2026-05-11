import type { Meta, StoryObj } from "@storybook/react";
import { SetPlanRowEmpty } from "./set-plan-row-empty";

const meta = {
	title: "View/V2 プログラム詳細/SetPlanRow/値未入力",
	component: SetPlanRowEmpty,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
	args: {
		index: 0,
	},
	decorators: [
		(Story) => (
			<div className="w-96">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof SetPlanRowEmpty>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const HigherIndex: Story = {
	args: { index: 4 },
};
