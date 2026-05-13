import type { Meta, StoryObj } from "@storybook/react";
import type { ComponentProps, FC } from "react";
import { useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { SetPlanRowWeightXReps } from "./set-plan-row-weight-x-reps";
import {
	findEditDialog,
	findInputByLabel,
	requireButtonInDialogByName,
} from "./stories-test-utils";

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
	},
	decorators: [
		(Story) => (
			<div className="w-96">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof SetPlanRowWeightXReps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Lbs: Story = {
	args: { weight: 225, weightUnit: "lbs" },
};

export const DesktopEditingCommitsOnEnter: Story = {
	name: "広画面: 編集して Enter で確定",
	globals: { viewport: { value: "desktop" } },
	render: (args) => <StatefulRow {...args} />,
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
		await userEvent.keyboard("110{Enter}");
		await waitFor(() => {
			expect(args.onChange).toHaveBeenCalledWith({ weight: 110, reps: 5 });
		});
		await waitFor(() => {
			expect(findEditDialog()).toBeNull();
		});
	},
};

export const DesktopEditingCommitsOnConfirmButton: Story = {
	name: "広画面: 編集してチェックアイコンで確定",
	globals: { viewport: { value: "desktop" } },
	render: (args) => <StatefulRow {...args} />,
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
		await userEvent.keyboard("120");
		await userEvent.click(requireButtonInDialogByName(/確定/));
		await waitFor(() => {
			expect(args.onChange).toHaveBeenCalledWith({ weight: 120, reps: 5 });
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

export const MobileEditingCommitsOnEnter: Story = {
	name: "狭画面: Drawer で編集して Enter で確定",
	globals: { viewport: { value: "mobile" } },
	args: { index: 2 },
	render: (args) => <StatefulRow {...args} />,
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		await userEvent.click(
			canvas.getByRole("button", { name: "ベンチプレス 3セット目を編集" }),
		);
		await waitFor(() => {
			expect(findEditDialog()).not.toBeNull();
		});
		expect(findEditDialog()?.textContent).toContain("ベンチプレス 3セット目");
		const weightInput = findInputByLabel("重量 (kg)");
		await userEvent.tripleClick(weightInput);
		await userEvent.keyboard("110{Enter}");
		await waitFor(() => {
			expect(args.onChange).toHaveBeenCalledWith({ weight: 110, reps: 5 });
		});
		await waitFor(() => {
			expect(findEditDialog()).toBeNull();
		});
	},
};

const StatefulRow: FC<ComponentProps<typeof SetPlanRowWeightXReps>> = ({
	weight: initialWeight,
	reps: initialReps,
	onChange,
	...rest
}) => {
	const [value, setValue] = useState({
		weight: initialWeight,
		reps: initialReps,
	});
	const handleChange = (next: { weight: number; reps: number }) => {
		setValue(next);
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
