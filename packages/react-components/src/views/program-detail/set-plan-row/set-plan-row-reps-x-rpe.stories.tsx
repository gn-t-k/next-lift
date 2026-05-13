import type { Meta, StoryObj } from "@storybook/react";
import type { ComponentProps, FC } from "react";
import { useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import type { SetPlanWithParams } from "../set-plan-types";
import { SetPlanRowRepsXRpe } from "./set-plan-row-reps-x-rpe";
import {
	findEditDialog,
	findInputByLabel,
	requireButtonInDialogByName,
} from "./stories-test-utils";

type Value = Extract<SetPlanWithParams, { pattern: "reps-x-rpe" }>;

const StatefulRow: FC<ComponentProps<typeof SetPlanRowRepsXRpe>> = ({
	reps: initialReps,
	rpe: initialRpe,
	onChange,
	...rest
}) => {
	const [value, setValue] = useState<Value>({
		pattern: "reps-x-rpe",
		reps: initialReps,
		rpe: initialRpe,
	});
	const handleChange = (next: SetPlanWithParams) => {
		if (next.pattern === "reps-x-rpe") setValue(next);
		onChange(next);
	};
	return (
		<SetPlanRowRepsXRpe
			{...rest}
			reps={value.reps}
			rpe={value.rpe}
			onChange={handleChange}
		/>
	);
};

const meta = {
	title: "View/V2 プログラム詳細/SetPlanRow/回数×RPE",
	component: SetPlanRowRepsXRpe,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
	args: {
		index: 0,
		reps: 12,
		rpe: 8,
		weightUnit: "kg",
		weightStep: 2.5,
		exerciseName: "トライセプスプッシュダウン",
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
} satisfies Meta<typeof SetPlanRowRepsXRpe>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const EditRepsInSameKind: Story = {
	name: "回数×RPE タブのまま回数を変更して確定",
	globals: { viewport: { value: "desktop" } },
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		await userEvent.click(
			canvas.getByRole("button", {
				name: "トライセプスプッシュダウン 1セット目を編集",
			}),
		);
		await waitFor(() => {
			expect(findEditDialog()).not.toBeNull();
		});
		const repsInput = findInputByLabel("回数");
		await userEvent.tripleClick(repsInput);
		await userEvent.keyboard("15");
		await userEvent.click(requireButtonInDialogByName(/確定/));
		await waitFor(() => {
			expect(args.onChange).toHaveBeenCalledWith({
				pattern: "reps-x-rpe",
				reps: 15,
				rpe: 8,
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
			canvas.getByRole("button", {
				name: "トライセプスプッシュダウン 1セット目を編集",
			}),
		);
		await waitFor(() => {
			expect(findEditDialog()).not.toBeNull();
		});
		const repsInput = findInputByLabel("回数");
		await userEvent.tripleClick(repsInput);
		await userEvent.keyboard("999{Escape}");
		await waitFor(() => {
			expect(findEditDialog()).toBeNull();
		});
		expect(args.onChange).not.toHaveBeenCalled();
	},
};

export const MobileEdit: Story = {
	name: "狭画面: Drawer で RPE トグルを変更して確定",
	globals: { viewport: { value: "mobile" } },
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		await userEvent.click(
			canvas.getByRole("button", {
				name: "トライセプスプッシュダウン 1セット目を編集",
			}),
		);
		await waitFor(() => {
			expect(findEditDialog()).not.toBeNull();
		});
		await userEvent.click(requireButtonInDialogByName("9"));
		await userEvent.click(requireButtonInDialogByName(/確定/));
		await waitFor(() => {
			expect(args.onChange).toHaveBeenCalledWith({
				pattern: "reps-x-rpe",
				reps: 12,
				rpe: 9,
			});
		});
	},
};
