import type { Meta, StoryObj } from "@storybook/react";
import type { ComponentProps, FC } from "react";
import { useState } from "react";
import { expect, fn, screen, userEvent, waitFor, within } from "storybook/test";
import type { SetPlanWithParams } from "../set-plan-types";
import { SetPlanRowRepsRpe } from "./set-plan-row-reps-rpe";

type Value = Extract<SetPlanWithParams, { pattern: "reps-rpe" }>;

const StatefulRow: FC<ComponentProps<typeof SetPlanRowRepsRpe>> = ({
	reps: initialReps,
	rpe: initialRpe,
	onChange,
	...rest
}) => {
	const [value, setValue] = useState<Value>({
		pattern: "reps-rpe",
		reps: initialReps,
		rpe: initialRpe,
	});
	const handleChange = (next: SetPlanWithParams) => {
		if (next.pattern === "reps-rpe") setValue(next);
		onChange(next);
	};
	return (
		<SetPlanRowRepsRpe
			{...rest}
			reps={value.reps}
			rpe={value.rpe}
			onChange={handleChange}
		/>
	);
};

const meta = {
	title: "View/V2 プログラム詳細/SetPlanRow/回数×RPE",
	component: SetPlanRowRepsRpe,
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
} satisfies Meta<typeof SetPlanRowRepsRpe>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const EditRepsInSameTab: Story = {
	name: "回数×RPE タブのまま回数を変更して確定",
	globals: { viewport: { value: "desktop" } },
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		await userEvent.click(
			canvas.getByRole("button", {
				name: "トライセプスプッシュダウン 1セット目を編集",
			}),
		);
		const dialog = await screen.findByRole("dialog");
		const repsInput = within(dialog).getByRole("textbox", { name: "回数" });
		await userEvent.tripleClick(repsInput);
		await userEvent.keyboard("15");
		await userEvent.click(within(dialog).getByRole("button", { name: /確定/ }));
		await waitFor(() => {
			expect(args.onChange).toHaveBeenCalledWith({
				pattern: "reps-rpe",
				reps: 15,
				rpe: 8,
			});
		});
	},
};
