import type { Meta, StoryObj } from "@storybook/react";
import type { ComponentProps, FC } from "react";
import { useState } from "react";
import { expect, fn, screen, userEvent, waitFor, within } from "storybook/test";
import type { SetPlanWithParams } from "../set-plan-types";
import { SetPlanRowWeightReps } from "./set-plan-row-weight-reps";

type Value = Extract<SetPlanWithParams, { pattern: "weight-reps" }>;

const StatefulRow: FC<ComponentProps<typeof SetPlanRowWeightReps>> = ({
	weight: initialWeight,
	reps: initialReps,
	onChange,
	...rest
}) => {
	const [value, setValue] = useState<Value>({
		pattern: "weight-reps",
		weight: initialWeight,
		reps: initialReps,
	});
	const handleChange = (next: SetPlanWithParams) => {
		if (next.pattern === "weight-reps") setValue(next);
		onChange(next);
	};
	return (
		<SetPlanRowWeightReps
			{...rest}
			weight={value.weight}
			reps={value.reps}
			onChange={handleChange}
		/>
	);
};

const meta = {
	title: "View/V2 プログラム詳細/SetPlanRow/重量×回数",
	component: SetPlanRowWeightReps,
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
} satisfies Meta<typeof SetPlanRowWeightReps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Lbs: Story = {
	args: { weight: 225, weightUnit: "lbs" },
};

export const EditWeightInSameTab: Story = {
	name: "重量×回数タブのままで値を編集して確定",
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
			expect(args.onChange).toHaveBeenCalledWith({
				pattern: "weight-reps",
				weight: 110,
				reps: 5,
			});
		});
		await waitFor(() => {
			expect(screen.queryByRole("dialog")).toBeNull();
		});
	},
};

export const SwitchTabKeepsWeight: Story = {
	name: "重量×RPE タブに切り替えると重量は保持・RPE を入力して pattern 変更",
	globals: { viewport: { value: "desktop" } },
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		await userEvent.click(
			canvas.getByRole("button", { name: "ベンチプレス 1セット目を編集" }),
		);
		const dialog = await screen.findByRole("dialog");
		// 「重量×RPE」タブに切り替えると重量 100 は保持され、確定ボタンは RPE 未入力で disabled
		await userEvent.click(
			within(dialog).getByRole("tab", { name: "重量×RPE" }),
		);
		expect(
			(
				within(dialog).getByRole("textbox", {
					name: "重量 (kg)",
				}) as HTMLInputElement
			).value,
		).toBe("100");
		expect(within(dialog).getByRole("button", { name: /確定/ })).toBeDisabled();
		// RPE を入れたら確定可能、pattern 変更された payload で commit
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

export const EscapeDiscardsDraft: Story = {
	name: "Escape で破棄して保存しない",
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
		await userEvent.keyboard("999{Escape}");
		await waitFor(() => {
			expect(screen.queryByRole("dialog")).toBeNull();
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
		const dialog = await screen.findByRole("dialog");
		const weightInput = within(dialog).getByRole("textbox", {
			name: "重量 (kg)",
		});
		await userEvent.tripleClick(weightInput);
		await userEvent.keyboard("110");
		await userEvent.click(within(dialog).getByRole("button", { name: /確定/ }));
		await waitFor(() => {
			expect(args.onChange).toHaveBeenCalledWith({
				pattern: "weight-reps",
				weight: 110,
				reps: 5,
			});
		});
	},
};
