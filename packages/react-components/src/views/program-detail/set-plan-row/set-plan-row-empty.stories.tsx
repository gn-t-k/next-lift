import type { Meta, StoryObj } from "@storybook/react";
import type { ComponentProps, FC } from "react";
import { useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import type { Pattern } from "../set-plan-types";
import { SetPlanRowEmpty } from "./set-plan-row-empty";
import {
	findEditDialog,
	requireButtonInDialogByName,
} from "./stories-test-utils";

type Selection = { pattern: Pattern | null };

const StatefulRow: FC<ComponentProps<typeof SetPlanRowEmpty>> = ({
	onSelectKind,
	...rest
}) => {
	const [selection, setSelection] = useState<Selection>({ pattern: null });
	const handleSelectKind = (kind: Pattern) => {
		setSelection({ pattern: kind });
		onSelectKind(kind);
	};
	if (selection.pattern !== null) {
		return (
			<div className="text-muted-fg text-sm">
				{`選択された種類: ${labelOf(selection.pattern)}（実画面ではここで対応する Row に切り替わる）`}
			</div>
		);
	}
	return <SetPlanRowEmpty {...rest} onSelectKind={handleSelectKind} />;
};

const labelOf = (pattern: Pattern): string => {
	switch (pattern) {
		case "weight-x-reps":
			return "重量 × 回数";
		case "weight-x-rpe":
			return "重量 × RPE";
		case "reps-x-rpe":
			return "回数 × RPE";
	}
};

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
	render: (args) => <StatefulRow {...args} />,
} satisfies Meta<typeof SetPlanRowEmpty>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const HigherIndex: Story = {
	args: { index: 4 },
};

export const DesktopSelectKindCommits: Story = {
	name: "広画面: 種類を選んで確定すると onSelectKind が呼ばれる",
	globals: { viewport: { value: "desktop" } },
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		await userEvent.click(
			canvas.getByRole("button", {
				name: "ベンチプレス 1セット目を編集",
			}),
		);
		await waitFor(() => {
			expect(findEditDialog()).not.toBeNull();
		});
		await userEvent.click(requireButtonInDialogByName("重量 × RPE"));
		expect(args.onSelectKind).not.toHaveBeenCalled();
		await userEvent.click(requireButtonInDialogByName(/確定/));
		await waitFor(() => {
			expect(args.onSelectKind).toHaveBeenCalledWith("weight-x-rpe");
		});
		await waitFor(() => {
			expect(findEditDialog()).toBeNull();
		});
	},
};

export const DesktopEscapeDoesNotSelect: Story = {
	name: "広画面: Escape で破棄して onSelectKind は呼ばれない",
	globals: { viewport: { value: "desktop" } },
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		await userEvent.click(
			canvas.getByRole("button", {
				name: "ベンチプレス 1セット目を編集",
			}),
		);
		await waitFor(() => {
			expect(findEditDialog()).not.toBeNull();
		});
		await userEvent.click(requireButtonInDialogByName("重量 × 回数"));
		await userEvent.keyboard("{Escape}");
		await waitFor(() => {
			expect(findEditDialog()).toBeNull();
		});
		expect(args.onSelectKind).not.toHaveBeenCalled();
	},
};

export const DesktopConfirmDisabledUntilSelection: Story = {
	name: "広画面: 未選択時は確定ボタンが押せない",
	globals: { viewport: { value: "desktop" } },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await userEvent.click(
			canvas.getByRole("button", {
				name: "ベンチプレス 1セット目を編集",
			}),
		);
		await waitFor(() => {
			expect(findEditDialog()).not.toBeNull();
		});
		const confirmButton = requireButtonInDialogByName(/確定/);
		expect(confirmButton).toBeDisabled();
	},
};

export const MobileSelectKindCommits: Story = {
	name: "狭画面: Drawer で種類を選んで確定する",
	globals: { viewport: { value: "mobile" } },
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		await userEvent.click(
			canvas.getByRole("button", {
				name: "ベンチプレス 1セット目を編集",
			}),
		);
		await waitFor(() => {
			expect(findEditDialog()).not.toBeNull();
		});
		await userEvent.click(requireButtonInDialogByName("回数 × RPE"));
		await userEvent.click(requireButtonInDialogByName(/確定/));
		await waitFor(() => {
			expect(args.onSelectKind).toHaveBeenCalledWith("reps-x-rpe");
		});
		await waitFor(() => {
			expect(findEditDialog()).toBeNull();
		});
	},
};
