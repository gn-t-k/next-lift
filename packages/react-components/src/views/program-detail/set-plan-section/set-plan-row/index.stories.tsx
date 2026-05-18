import type { Meta, StoryObj } from "@storybook/react";
import type { ComponentProps, FC } from "react";
import { useState } from "react";
import { expect, fn, screen, userEvent, waitFor, within } from "storybook/test";
import type { SetPlan, SetPlanDraft } from "../set-plan-types";
import { SetPlanRow } from ".";

const StatefulRow: FC<ComponentProps<typeof SetPlanRow>> = ({
	setPlan: initial,
	onChange,
	...rest
}) => {
	const [setPlan, setSetPlan] = useState<SetPlan>(initial);
	const handleChange = (id: SetPlan["id"], next: SetPlanDraft) => {
		setSetPlan({ id, ...next });
		onChange(id, next);
	};
	return <SetPlanRow {...rest} setPlan={setPlan} onChange={handleChange} />;
};

const meta = {
	title: "View/V2 プログラム詳細/SetPlanRow",
	component: SetPlanRow,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
	args: {
		index: 0,
		setPlan: { id: "sp-1", pattern: "weight-reps", weight: 100, reps: 5 },
		weightUnit: "kg",
		weightStep: 2.5,
		exerciseName: "ベンチプレス",
		onChange: fn(),
		onDelete: fn(),
	},
	decorators: [
		(Story) => (
			<div className="w-96">
				<Story />
			</div>
		),
	],
	render: (args) => <StatefulRow {...args} />,
} satisfies Meta<typeof SetPlanRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WeightReps: Story = {
	name: "重量×回数",
};

export const WeightRepsLbs: Story = {
	name: "重量×回数 (lbs)",
	args: {
		setPlan: { id: "sp-1", pattern: "weight-reps", weight: 225, reps: 5 },
		weightUnit: "lbs",
	},
};

export const WeightRpe: Story = {
	name: "重量×RPE",
	args: {
		setPlan: { id: "sp-1", pattern: "weight-rpe", weight: 100, rpe: 8 },
	},
};

export const RepsRpe: Story = {
	name: "回数×RPE",
	args: {
		setPlan: { id: "sp-1", pattern: "reps-rpe", reps: 12, rpe: 8 },
		exerciseName: "トライセプスプッシュダウン",
	},
};

export const EditWiresUpOnChange: Story = {
	name: "編集ボタンから dialog を開いて確定すると onChange が呼ばれる",
	globals: { viewport: { value: "desktop" } },
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		await userEvent.click(
			canvas.getByRole("button", { name: "ベンチプレス 1セット目を編集" }),
		);
		const dialog = await screen.findByRole("dialog");
		const weightInput = within(dialog).getByRole("textbox", {
			name: "重量 (kg)",
		});
		await userEvent.tripleClick(weightInput);
		await userEvent.keyboard("110");
		await userEvent.click(within(dialog).getByRole("button", { name: /確定/ }));
		await waitFor(() => {
			expect(args.onChange).toHaveBeenCalledWith("sp-1", {
				pattern: "weight-reps",
				weight: 110,
				reps: 5,
			});
		});
	},
};

export const DeleteWiresUpOnDelete: Story = {
	name: "削除ボタンを押すと onDelete が setPlan の id で呼ばれる",
	args: { index: 1 },
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		await userEvent.click(
			canvas.getByRole("button", { name: "ベンチプレス 2セット目を削除" }),
		);
		await waitFor(() => {
			expect(args.onDelete).toHaveBeenCalledWith("sp-1");
		});
	},
};
