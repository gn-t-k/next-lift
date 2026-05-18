import type { Meta, StoryObj } from "@storybook/react";
import type { ComponentProps, FC } from "react";
import { useState } from "react";
import { expect, fn, screen, userEvent, waitFor, within } from "storybook/test";
import type { SetPlanWithParams } from "../set-plan-types";
import { SetPlanRowWeightRpe } from "./set-plan-row-weight-rpe";

type Value = Extract<SetPlanWithParams, { pattern: "weight-rpe" }>;

const StatefulRow: FC<ComponentProps<typeof SetPlanRowWeightRpe>> = ({
	weight: initialWeight,
	rpe: initialRpe,
	onChange,
	...rest
}) => {
	const [value, setValue] = useState<Value>({
		pattern: "weight-rpe",
		weight: initialWeight,
		rpe: initialRpe,
	});
	const handleChange = (next: SetPlanWithParams) => {
		if (next.pattern === "weight-rpe") setValue(next);
		onChange(next);
	};
	return (
		<SetPlanRowWeightRpe
			{...rest}
			weight={value.weight}
			rpe={value.rpe}
			onChange={handleChange}
		/>
	);
};

const meta = {
	title: "View/V2 プログラム詳細/SetPlanRow/重量×RPE",
	component: SetPlanRowWeightRpe,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
	args: {
		index: 0,
		weight: 100,
		rpe: 8,
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
} satisfies Meta<typeof SetPlanRowWeightRpe>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const EditRpeInSameTab: Story = {
	name: "重量×RPE タブのまま RPE を変更して確定",
	globals: { viewport: { value: "desktop" } },
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		await userEvent.click(
			canvas.getByRole("button", { name: "ベンチプレス 1セット目を編集" }),
		);
		const dialog = await screen.findByRole("dialog");
		await userEvent.click(within(dialog).getByRole("radio", { name: "9" }));
		await userEvent.click(within(dialog).getByRole("button", { name: /確定/ }));
		await waitFor(() => {
			expect(args.onChange).toHaveBeenCalledWith({
				pattern: "weight-rpe",
				weight: 100,
				rpe: 9,
			});
		});
	},
};
