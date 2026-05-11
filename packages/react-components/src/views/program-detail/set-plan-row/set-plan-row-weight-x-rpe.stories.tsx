import type { Meta, StoryObj } from "@storybook/react";
import type { ComponentProps, FC } from "react";
import { useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { SetPlanRowWeightXRpe } from "./set-plan-row-weight-x-rpe";
import {
	findEditDialog,
	findInputByLabel,
	requireButtonInDialogByName,
} from "./stories-test-utils";

const meta = {
	title: "View/V2 プログラム詳細/SetPlanRow/重量×RPE",
	component: SetPlanRowWeightXRpe,
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
	},
	decorators: [
		(Story) => (
			<div className="w-96">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof SetPlanRowWeightXRpe>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const DesktopEditingSavesOnRpeToggleClick: Story = {
	name: "広画面: RPE トグルで即保存",
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
		await userEvent.click(requireButtonInDialogByName("9"));
		await waitFor(() => {
			expect(args.onChange).toHaveBeenCalledWith({ weight: 100, rpe: 9 });
		});
	},
};

export const DesktopEscapeDoesNotSave: Story = {
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

export const DesktopRpeCentersOnOpen: Story = {
	name: "広画面: RPE 既選択時に中央スクロールで開く",
	globals: { viewport: { value: "desktop" } },
	render: (args) => <StatefulRow {...args} />,
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await userEvent.click(
			canvas.getByRole("button", { name: "ベンチプレス 1セット目を編集" }),
		);
		await waitFor(() => {
			expect(findEditDialog()).not.toBeNull();
		});
		const rpe8 = requireButtonInDialogByName("8");
		expect(rpe8).toHaveAttribute("data-selected", "true");
		const inner = rpe8.closest<HTMLElement>(".overflow-x-auto");
		if (inner === null) throw new Error("scroll container not found");
		const rpeRect = rpe8.getBoundingClientRect();
		const innerRect = inner.getBoundingClientRect();
		const rpeCenter = rpeRect.left + rpeRect.width / 2;
		const innerCenter = innerRect.left + innerRect.width / 2;
		expect(Math.abs(rpeCenter - innerCenter)).toBeLessThan(8);
	},
};

export const MobileEditingSavesOnEnter: Story = {
	name: "狭画面: Drawer で編集して Enter で即保存",
	globals: { viewport: { value: "mobile" } },
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
			expect(args.onChange).toHaveBeenCalledWith({ weight: 110, rpe: 8 });
		});
	},
};

const StatefulRow: FC<ComponentProps<typeof SetPlanRowWeightXRpe>> = ({
	weight: initialWeight,
	rpe: initialRpe,
	onChange,
	...rest
}) => {
	const [value, setValue] = useState({
		weight: initialWeight,
		rpe: initialRpe,
	});
	const handleChange = (next: { weight: number; rpe: number }) => {
		setValue(next);
		onChange(next);
	};
	return (
		<SetPlanRowWeightXRpe
			{...rest}
			weight={value.weight}
			rpe={value.rpe}
			onChange={handleChange}
		/>
	);
};
