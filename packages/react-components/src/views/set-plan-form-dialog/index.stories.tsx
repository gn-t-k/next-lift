import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, screen, userEvent, waitFor, within } from "storybook/test";
import { Button } from "../../primitives/button";
import { SetPlanFormDialog } from ".";

const meta = {
	title: "View/V2 プログラム詳細/SetPlanFormDialog",
	component: SetPlanFormDialog,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
	args: {
		title: "セット計画を編集",
		trigger: <Button>開く</Button>,
		initial: { pattern: "weight-reps", weight: 100, reps: 5 },
		weightUnit: "kg",
		weightStep: 2.5,
		onSubmit: fn(),
	},
	decorators: [
		(Story) => (
			<div className="w-96">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof SetPlanFormDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithInitialWeightReps: Story = {
	name: "初期値: 重量×回数",
};

export const WithInitialWeightRpe: Story = {
	name: "初期値: 重量×RPE",
	args: {
		initial: { pattern: "weight-rpe", weight: 100, rpe: 8 },
	},
};

export const WithInitialRepsRpe: Story = {
	name: "初期値: 回数×RPE",
	args: {
		initial: { pattern: "reps-rpe", reps: 12, rpe: 8 },
	},
};

export const InitialNoneDisablesCommit: Story = {
	name: "初期値なし: 確定ボタンが disabled で開く",
	args: { initial: undefined },
	globals: { viewport: { value: "desktop" } },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await userEvent.click(canvas.getByRole("button", { name: "開く" }));
		const dialog = await screen.findByRole("dialog");
		expect(within(dialog).getByRole("button", { name: /確定/ })).toBeDisabled();
	},
};

export const InitialNoneFillThenCommit: Story = {
	name: "初期値なし: 値を入力して確定すると onSubmit が呼ばれる",
	args: { initial: undefined },
	globals: { viewport: { value: "desktop" } },
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		await userEvent.click(canvas.getByRole("button", { name: "開く" }));
		const dialog = await screen.findByRole("dialog");
		const weightInput = within(dialog).getByRole("textbox", {
			name: "重量 (kg)",
		});
		const repsInput = within(dialog).getByRole("textbox", { name: "回数" });
		await userEvent.tripleClick(weightInput);
		await userEvent.keyboard("60");
		await userEvent.tripleClick(repsInput);
		await userEvent.keyboard("10");
		await userEvent.click(within(dialog).getByRole("button", { name: /確定/ }));
		await waitFor(() => {
			expect(args.onSubmit).toHaveBeenCalledWith({
				pattern: "weight-reps",
				weight: 60,
				reps: 10,
			});
		});
	},
};

export const SwitchTabKeepsWeight: Story = {
	name: "重量×RPE タブに切り替えると重量は保持・RPE を入力して pattern 変更",
	globals: { viewport: { value: "desktop" } },
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		await userEvent.click(canvas.getByRole("button", { name: "開く" }));
		const dialog = await screen.findByRole("dialog");
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
		await userEvent.click(within(dialog).getByRole("radio", { name: "9" }));
		await userEvent.click(within(dialog).getByRole("button", { name: /確定/ }));
		await waitFor(() => {
			expect(args.onSubmit).toHaveBeenCalledWith({
				pattern: "weight-rpe",
				weight: 100,
				rpe: 9,
			});
		});
	},
};

export const EscapeDiscardsDraft: Story = {
	name: "Escape で破棄して onSubmit は呼ばれない",
	globals: { viewport: { value: "desktop" } },
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		await userEvent.click(canvas.getByRole("button", { name: "開く" }));
		const dialog = await screen.findByRole("dialog");
		const weightInput = within(dialog).getByRole("textbox", {
			name: "重量 (kg)",
		});
		await userEvent.tripleClick(weightInput);
		await userEvent.keyboard("999{Escape}");
		await waitFor(() => {
			expect(screen.queryByRole("dialog")).toBeNull();
		});
		expect(args.onSubmit).not.toHaveBeenCalled();
	},
};

export const EscapeRestoresInitialOnReopen: Story = {
	name: "Escape で破棄して再度開くとフィールドが initial 値に戻る",
	globals: { viewport: { value: "desktop" } },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const trigger = canvas.getByRole("button", { name: "開く" });
		await userEvent.click(trigger);
		const dialog1 = await screen.findByRole("dialog");
		const weightInput1 = within(dialog1).getByRole("textbox", {
			name: "重量 (kg)",
		});
		await userEvent.tripleClick(weightInput1);
		await userEvent.keyboard("999");
		await userEvent.keyboard("{Escape}");
		await waitFor(() => {
			expect(screen.queryByRole("dialog")).toBeNull();
		});
		await userEvent.click(trigger);
		const dialog2 = await screen.findByRole("dialog");
		const weightInput2 = within(dialog2).getByRole("textbox", {
			name: "重量 (kg)",
		});
		expect(weightInput2).toHaveValue("100");
	},
};

export const CommitWithoutBlurPersistsLatestValue: Story = {
	name: "入力後 blur せずに確定ボタンを押しても最新値が commit される",
	args: { initial: undefined },
	globals: { viewport: { value: "desktop" } },
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		await userEvent.click(canvas.getByRole("button", { name: "開く" }));
		const dialog = await screen.findByRole("dialog");
		const weightInput = within(dialog).getByRole("textbox", {
			name: "重量 (kg)",
		});
		const repsInput = within(dialog).getByRole("textbox", { name: "回数" });
		await userEvent.tripleClick(weightInput);
		await userEvent.keyboard("80");
		await userEvent.tripleClick(repsInput);
		await userEvent.keyboard("10");
		await userEvent.click(within(dialog).getByRole("button", { name: /確定/ }));
		await waitFor(() => {
			expect(args.onSubmit).toHaveBeenCalledWith({
				pattern: "weight-reps",
				weight: 80,
				reps: 10,
			});
		});
	},
};

export const MobileDrawerCommit: Story = {
	name: "狭画面: Drawer で開いて値を変更して確定",
	globals: { viewport: { value: "mobile" } },
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		await userEvent.click(canvas.getByRole("button", { name: "開く" }));
		const dialog = await screen.findByRole("dialog");
		const weightInput = within(dialog).getByRole("textbox", {
			name: "重量 (kg)",
		});
		await userEvent.tripleClick(weightInput);
		await userEvent.keyboard("110");
		await userEvent.click(within(dialog).getByRole("button", { name: /確定/ }));
		await waitFor(() => {
			expect(args.onSubmit).toHaveBeenCalledWith({
				pattern: "weight-reps",
				weight: 110,
				reps: 5,
			});
		});
	},
};
