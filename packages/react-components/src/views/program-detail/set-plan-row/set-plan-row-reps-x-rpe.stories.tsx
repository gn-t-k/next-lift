import type { Meta, StoryObj } from "@storybook/react";
import type { ComponentProps, FC } from "react";
import { useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { SetPlanRowRepsXRpe } from "./set-plan-row-reps-x-rpe";
import {
	findEditDialog,
	findInputByLabel,
	requireButtonInDialogByName,
} from "./stories-test-utils";

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
		exerciseName: "トライセプスプッシュダウン",
		onChange: fn(),
	},
	decorators: [
		(Story) => (
			<div className="w-96">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof SetPlanRowRepsXRpe>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const DesktopEditingCommitsOnEnter: Story = {
	name: "広画面: 回数を編集して Enter で確定",
	globals: { viewport: { value: "desktop" } },
	render: (args) => <StatefulRow {...args} />,
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
		await userEvent.keyboard("15{Enter}");
		await waitFor(() => {
			expect(args.onChange).toHaveBeenCalledWith({ reps: 15, rpe: 8 });
		});
		await waitFor(() => {
			expect(findEditDialog()).toBeNull();
		});
	},
};

export const DesktopEscapeDiscardsDraft: Story = {
	name: "広画面: Escape で破棄して保存しない",
	globals: { viewport: { value: "desktop" } },
	render: (args) => <StatefulRow {...args} />,
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

export const MobileRpeChangeCommitsOnConfirmButton: Story = {
	name: "狭画面: Drawer で RPE トグルを押してチェックアイコンで確定",
	globals: { viewport: { value: "mobile" } },
	render: (args) => <StatefulRow {...args} />,
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
		expect(args.onChange).not.toHaveBeenCalled();
		await userEvent.click(requireButtonInDialogByName(/確定/));
		await waitFor(() => {
			expect(args.onChange).toHaveBeenCalledWith({ reps: 12, rpe: 9 });
		});
		await waitFor(() => {
			expect(findEditDialog()).toBeNull();
		});
	},
};

const StatefulRow: FC<ComponentProps<typeof SetPlanRowRepsXRpe>> = ({
	reps: initialReps,
	rpe: initialRpe,
	onChange,
	...rest
}) => {
	const [value, setValue] = useState({ reps: initialReps, rpe: initialRpe });
	const handleChange = (next: { reps: number; rpe: number }) => {
		setValue(next);
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
