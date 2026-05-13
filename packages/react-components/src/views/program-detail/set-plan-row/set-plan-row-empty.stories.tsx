import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { SetPlanRowEmpty } from "./set-plan-row-empty";
import {
	findEditDialog,
	findInputByLabel,
	requireButtonInDialogByName,
	requireTabInDialogByName,
} from "./stories-test-utils";

const meta = {
	title: "View/V2 プログラム詳細/SetPlanRow/値未入力",
	component: SetPlanRowEmpty,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
	args: {
		index: 0,
		exerciseName: "ベンチプレス",
		weightUnit: "kg",
		weightStep: 2.5,
		onSubmit: fn(),
		onDelete: fn(),
	},
	decorators: [
		(Story) => (
			<div className="w-96">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof SetPlanRowEmpty>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const HigherIndex: Story = {
	args: { index: 4 },
};

export const DesktopWeightXRepsCommits: Story = {
	name: "広画面: 重量×回数タブで値を入れて確定",
	globals: { viewport: { value: "desktop" } },
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		await userEvent.click(
			canvas.getByRole("button", { name: "ベンチプレス 1セット目を編集" }),
		);
		await waitFor(() => {
			expect(findEditDialog()).not.toBeNull();
		});
		// 初期で重量×回数タブが選ばれている前提
		const weightInput = findInputByLabel("重量 (kg)");
		await userEvent.tripleClick(weightInput);
		await userEvent.keyboard("80");
		const repsInput = findInputByLabel("回数");
		await userEvent.tripleClick(repsInput);
		await userEvent.keyboard("8");
		await userEvent.click(requireButtonInDialogByName(/確定/));
		await waitFor(() => {
			expect(args.onSubmit).toHaveBeenCalledWith({
				pattern: "weight-x-reps",
				weight: 80,
				reps: 8,
			});
		});
		await waitFor(() => {
			expect(findEditDialog()).toBeNull();
		});
	},
};

export const DesktopSwitchTabAndCommits: Story = {
	name: "広画面: タブを重量×RPEに切り替えて値を入れて確定",
	globals: { viewport: { value: "desktop" } },
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		await userEvent.click(
			canvas.getByRole("button", { name: "ベンチプレス 1セット目を編集" }),
		);
		await waitFor(() => {
			expect(findEditDialog()).not.toBeNull();
		});
		await userEvent.click(requireTabInDialogByName("重量×RPE"));
		const weightInput = findInputByLabel("重量 (kg)");
		await userEvent.tripleClick(weightInput);
		await userEvent.keyboard("100");
		await userEvent.click(requireButtonInDialogByName("9"));
		await userEvent.click(requireButtonInDialogByName(/確定/));
		await waitFor(() => {
			expect(args.onSubmit).toHaveBeenCalledWith({
				pattern: "weight-x-rpe",
				weight: 100,
				rpe: 9,
			});
		});
	},
};

export const DesktopConfirmDisabledUntilAllFieldsFilled: Story = {
	name: "広画面: 必要フィールドが揃うまで確定ボタンは disabled",
	globals: { viewport: { value: "desktop" } },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await userEvent.click(
			canvas.getByRole("button", { name: "ベンチプレス 1セット目を編集" }),
		);
		await waitFor(() => {
			expect(findEditDialog()).not.toBeNull();
		});
		// 初期は重量×回数で両方未入力なので disabled
		expect(requireButtonInDialogByName(/確定/)).toBeDisabled();
		// 重量だけ入れても、回数が空なので disabled のまま
		// 回数フィールドにフォーカス移動して重量を blur → onChange で commit
		const weightInput = findInputByLabel("重量 (kg)");
		const repsInput = findInputByLabel("回数");
		await userEvent.tripleClick(weightInput);
		await userEvent.keyboard("80");
		await userEvent.tripleClick(repsInput);
		expect(requireButtonInDialogByName(/確定/)).toBeDisabled();
		// 回数も入れて、Tab で blur すれば enabled
		await userEvent.keyboard("8");
		await userEvent.tab();
		await waitFor(() => {
			expect(requireButtonInDialogByName(/確定/)).toBeEnabled();
		});
	},
};

export const DesktopEscapeDiscardsDraft: Story = {
	name: "広画面: Escape で破棄して onSubmit は呼ばれない",
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
		expect(args.onSubmit).not.toHaveBeenCalled();
	},
};

export const MobileRepsXRpeCommits: Story = {
	name: "狭画面: Drawer で回数×RPE タブを選んで確定",
	globals: { viewport: { value: "mobile" } },
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		await userEvent.click(
			canvas.getByRole("button", { name: "ベンチプレス 1セット目を編集" }),
		);
		await waitFor(() => {
			expect(findEditDialog()).not.toBeNull();
		});
		await userEvent.click(requireTabInDialogByName("回数×RPE"));
		const repsInput = findInputByLabel("回数");
		await userEvent.tripleClick(repsInput);
		await userEvent.keyboard("12");
		await userEvent.click(requireButtonInDialogByName("8"));
		await userEvent.click(requireButtonInDialogByName(/確定/));
		await waitFor(() => {
			expect(args.onSubmit).toHaveBeenCalledWith({
				pattern: "reps-x-rpe",
				reps: 12,
				rpe: 8,
			});
		});
	},
};
