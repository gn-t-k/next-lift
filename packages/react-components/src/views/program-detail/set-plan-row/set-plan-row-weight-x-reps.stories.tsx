import type { Meta, StoryObj } from "@storybook/react";
import type { ComponentProps, FC } from "react";
import { useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import type { SetPlanWithParams } from "../set-plan-types";
import { SetPlanRowWeightXReps } from "./set-plan-row-weight-x-reps";
import {
	findEditDialog,
	findInputByLabel,
	requireButtonInDialogByName,
	requireTabInDialogByName,
} from "./stories-test-utils";

type Value = Extract<SetPlanWithParams, { pattern: "weight-x-reps" }>;

const StatefulRow: FC<ComponentProps<typeof SetPlanRowWeightXReps>> = ({
	weight: initialWeight,
	reps: initialReps,
	onChange,
	...rest
}) => {
	const [value, setValue] = useState<Value>({
		pattern: "weight-x-reps",
		weight: initialWeight,
		reps: initialReps,
	});
	const handleChange = (next: SetPlanWithParams) => {
		if (next.pattern === "weight-x-reps") setValue(next);
		onChange(next);
	};
	return (
		<SetPlanRowWeightXReps
			{...rest}
			weight={value.weight}
			reps={value.reps}
			onChange={handleChange}
		/>
	);
};

const meta = {
	title: "View/V2 プログラム詳細/SetPlanRow/重量×回数",
	component: SetPlanRowWeightXReps,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
	args: {
		index: 0,
		weight: 100,
		reps: 5,
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
} satisfies Meta<typeof SetPlanRowWeightXReps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Lbs: Story = {
	args: { weight: 225, weightUnit: "lbs" },
};

export const EditValuesInSameKind: Story = {
	name: "重量×回数タブのままで値を編集して確定",
	globals: { viewport: { value: "desktop" } },
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		await userEvent.click(
			canvas.getByRole("button", { name: "ベンチプレス 1セット目を編集" }),
		);
		await waitFor(() => {
			expect(findEditDialog()).not.toBeNull();
		});
		const weightInput = findInputByLabel("重量 (kg)");
		await userEvent.tripleClick(weightInput);
		await userEvent.keyboard("110");
		await userEvent.click(requireButtonInDialogByName(/確定/));
		await waitFor(() => {
			expect(args.onChange).toHaveBeenCalledWith({
				pattern: "weight-x-reps",
				weight: 110,
				reps: 5,
			});
		});
		await waitFor(() => {
			expect(findEditDialog()).toBeNull();
		});
	},
};

export const SwitchToWeightXRpeKeepsWeight: Story = {
	name: "重量×RPE タブに切り替えると重量は保持・RPE を入力して kind 変更",
	globals: { viewport: { value: "desktop" } },
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		await userEvent.click(
			canvas.getByRole("button", { name: "ベンチプレス 1セット目を編集" }),
		);
		await waitFor(() => {
			expect(findEditDialog()).not.toBeNull();
		});
		// 「重量×RPE」タブに切り替えると重量 100 は保持され、確定ボタンは RPE 未入力で disabled
		await userEvent.click(requireTabInDialogByName("重量×RPE"));
		expect(findInputByLabel("重量 (kg)").value).toBe("100");
		expect(requireButtonInDialogByName(/確定/)).toBeDisabled();
		// RPE を入れたら確定可能、kind 変更された payload で commit
		await userEvent.click(requireButtonInDialogByName("9"));
		await userEvent.click(requireButtonInDialogByName(/確定/));
		await waitFor(() => {
			expect(args.onChange).toHaveBeenCalledWith({
				pattern: "weight-x-rpe",
				weight: 100,
				rpe: 9,
			});
		});
	},
};

export const EscapeDiscardsDraft: Story = {
	name: "Escape で破棄して保存しない",
	globals: { viewport: { value: "desktop" } },
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		await userEvent.click(
			canvas.getByRole("button", { name: "ベンチプレス 1セット目を編集" }),
		);
		await waitFor(() => {
			expect(findEditDialog()).not.toBeNull();
		});
		const weightInput = findInputByLabel("重量 (kg)");
		await userEvent.tripleClick(weightInput);
		await userEvent.keyboard("999{Escape}");
		await waitFor(() => {
			expect(findEditDialog()).toBeNull();
		});
		expect(args.onChange).not.toHaveBeenCalled();
	},
};

export const MobileEdit: Story = {
	name: "狭画面: Drawer で編集して確定",
	globals: { viewport: { value: "mobile" } },
	args: { index: 2 },
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		await userEvent.click(
			canvas.getByRole("button", { name: "ベンチプレス 3セット目を編集" }),
		);
		await waitFor(() => {
			expect(findEditDialog()).not.toBeNull();
		});
		const weightInput = findInputByLabel("重量 (kg)");
		await userEvent.tripleClick(weightInput);
		await userEvent.keyboard("110");
		await userEvent.click(requireButtonInDialogByName(/確定/));
		await waitFor(() => {
			expect(args.onChange).toHaveBeenCalledWith({
				pattern: "weight-x-reps",
				weight: 110,
				reps: 5,
			});
		});
	},
};
