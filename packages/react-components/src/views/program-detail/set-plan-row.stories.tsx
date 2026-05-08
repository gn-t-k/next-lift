import type { Meta, StoryObj } from "@storybook/react";
import { SetPlanRow } from "./set-plan-row";

const meta = {
	title: "View/V2 プログラム詳細/SetPlanRow",
	component: SetPlanRow,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
	args: {
		index: 0,
		weightUnit: "kg",
	},
	decorators: [
		(Story) => (
			<div className="w-80">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof SetPlanRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WeightXReps: Story = {
	args: {
		params: { pattern: "weight-x-reps", weight: 100, reps: 5 },
	},
};

export const WeightXRepsLbs: Story = {
	args: {
		weightUnit: "lbs",
		params: { pattern: "weight-x-reps", weight: 225, reps: 5 },
	},
};

export const WeightXRpe: Story = {
	args: {
		params: { pattern: "weight-x-rpe", weight: 100, rpe: 9 },
	},
};

export const RepsXRpe: Story = {
	args: {
		params: { pattern: "reps-x-rpe", reps: 12, rpe: 8 },
	},
};

// 設計判断 #58 によりアプリ層が初期生成する SetPlan の params: null をそのまま表示する状態。
export const Empty: Story = {
	args: {
		params: null,
	},
};

// 連番の見え方確認用。同一 weightUnit / params で index だけ変える。
export const HigherIndex: Story = {
	args: {
		index: 5,
		params: { pattern: "weight-x-reps", weight: 100, reps: 5 },
	},
};
