import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, screen, userEvent, waitFor, within } from "storybook/test";
import { SetPlanRowEmpty } from "./set-plan-row-empty";

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
		onSelectKind: fn(),
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

export const SelectWeightXReps: Story = {
	name: "種類メニューから「重量 × 回数」を選んで onSelectKind が呼ばれる",
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		await userEvent.click(
			canvas.getByRole("button", {
				name: "ベンチプレス 1セット目の種類を選択",
			}),
		);
		await waitFor(() => {
			expect(screen.queryByRole("menu")).not.toBeNull();
		});
		await userEvent.click(
			screen.getByRole("menuitem", { name: "重量 × 回数" }),
		);
		await waitFor(() => {
			expect(args.onSelectKind).toHaveBeenCalledWith("weight-x-reps");
		});
		await waitFor(() => {
			expect(screen.queryByRole("menu")).toBeNull();
		});
	},
};

export const SelectWeightXRpe: Story = {
	name: "種類メニューから「重量 × RPE」を選ぶ",
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		await userEvent.click(
			canvas.getByRole("button", {
				name: "ベンチプレス 1セット目の種類を選択",
			}),
		);
		await waitFor(() => {
			expect(screen.queryByRole("menu")).not.toBeNull();
		});
		await userEvent.click(screen.getByRole("menuitem", { name: "重量 × RPE" }));
		await waitFor(() => {
			expect(args.onSelectKind).toHaveBeenCalledWith("weight-x-rpe");
		});
	},
};

export const SelectRepsXRpe: Story = {
	name: "種類メニューから「回数 × RPE」を選ぶ",
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		await userEvent.click(
			canvas.getByRole("button", {
				name: "ベンチプレス 1セット目の種類を選択",
			}),
		);
		await waitFor(() => {
			expect(screen.queryByRole("menu")).not.toBeNull();
		});
		await userEvent.click(screen.getByRole("menuitem", { name: "回数 × RPE" }));
		await waitFor(() => {
			expect(args.onSelectKind).toHaveBeenCalledWith("reps-x-rpe");
		});
	},
};

export const EscapeClosesMenuWithoutSelection: Story = {
	name: "Escape でメニューを閉じても onSelectKind は呼ばれない",
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		await userEvent.click(
			canvas.getByRole("button", {
				name: "ベンチプレス 1セット目の種類を選択",
			}),
		);
		await waitFor(() => {
			expect(screen.queryByRole("menu")).not.toBeNull();
		});
		await userEvent.keyboard("{Escape}");
		await waitFor(() => {
			expect(screen.queryByRole("menu")).toBeNull();
		});
		expect(args.onSelectKind).not.toHaveBeenCalled();
	},
};
