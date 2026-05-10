import type { Meta, StoryObj } from "@storybook/react";
import type { ComponentProps, FC } from "react";
import { useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { SetPlanRow } from ".";
import type { SetPlanPattern } from "./use-set-plan-editing";

const meta = {
	title: "View/V2 プログラム詳細/SetPlanRow",
	component: SetPlanRow,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
	args: {
		index: 0,
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
} satisfies Meta<typeof SetPlanRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Patterns: Story = {
	args: {
		pattern: null,
	},
	render: (args) => (
		<div className="flex flex-col">
			<SetPlanRow
				{...args}
				index={0}
				pattern={{ kind: "weight-x-reps", weight: 100, reps: 5 }}
			/>
			<SetPlanRow
				{...args}
				index={1}
				pattern={{ kind: "weight-x-reps", weight: 225, reps: 5 }}
				weightUnit="lbs"
			/>
			<SetPlanRow
				{...args}
				index={2}
				pattern={{ kind: "weight-x-rpe", weight: 100, rpe: 9 }}
			/>
			<SetPlanRow
				{...args}
				index={3}
				pattern={{ kind: "reps-x-rpe", reps: 12, rpe: 8 }}
			/>
			<SetPlanRow {...args} index={4} pattern={null} />
		</div>
	),
};

export const Editable: Story = {
	args: {
		pattern: { kind: "weight-x-reps", weight: 100, reps: 5 },
	},
	render: (args) => <StatefulRow {...args} />,
};

export const DesktopEditingSubmitByEnter: Story = {
	name: "広画面: Enter で確定",
	globals: { viewport: { value: "desktop" } },
	args: {
		pattern: { kind: "weight-x-reps", weight: 100, reps: 5 },
	},
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
			expect(args.onChange).toHaveBeenCalledWith({
				kind: "weight-x-reps",
				weight: 110,
				reps: 5,
			});
		});
	},
};

export const DesktopEditingSubmitByConfirmButton: Story = {
	name: "広画面: 確定ボタンで確定",
	globals: { viewport: { value: "desktop" } },
	args: {
		pattern: { kind: "weight-x-reps", weight: 100, reps: 5 },
	},
	render: (args) => <StatefulRow {...args} />,
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		await userEvent.click(
			canvas.getByRole("button", { name: "ベンチプレス 1セット目を編集" }),
		);
		await waitFor(() => {
			expect(findEditDialog()).not.toBeNull();
		});
		const repsInput = findInputByLabel("回数");
		await userEvent.tripleClick(repsInput);
		await userEvent.keyboard("8");
		await userEvent.click(requireButtonInDialogByName("確定"));
		await waitFor(() => {
			expect(args.onChange).toHaveBeenCalledWith({
				kind: "weight-x-reps",
				weight: 100,
				reps: 8,
			});
		});
	},
};

export const DesktopEditingCancelByEscape: Story = {
	name: "広画面: Escape でキャンセル",
	globals: { viewport: { value: "desktop" } },
	args: {
		pattern: { kind: "weight-x-reps", weight: 100, reps: 5 },
	},
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

export const DesktopEditingPatternSwitchClearsValues: Story = {
	name: "広画面: パターン切替で値クリア",
	globals: { viewport: { value: "desktop" } },
	args: {
		pattern: { kind: "weight-x-reps", weight: 100, reps: 5 },
	},
	render: (args) => <StatefulRow {...args} />,
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await userEvent.click(
			canvas.getByRole("button", { name: "ベンチプレス 1セット目を編集" }),
		);
		await waitFor(() => {
			expect(findEditDialog()).not.toBeNull();
		});
		await userEvent.click(requireButtonInDialogByName(/^パターンを変更/));
		await waitFor(() => {
			expect(findMenuItemByName("重量 × RPE")).toBeDefined();
		});
		const initialItem = findMenuItemByName("重量 × 回数");
		expect(initialItem?.getAttribute("data-selected")).toBe("true");
		const menuItem = findMenuItemByName("重量 × RPE");
		if (menuItem === undefined) throw new Error("menu item not found");
		await userEvent.click(menuItem);
		await waitFor(() => {
			const weight = findInputByLabel("重量 (kg)");
			expect(weight).toHaveValue("");
		});
		const rpe8 = requireButtonInDialogByName("8");
		expect(rpe8).not.toHaveAttribute("data-selected");
		expect(requireButtonInDialogByName("確定")).toBeDisabled();
	},
};

export const DesktopEditingRpeCentersOnOpen: Story = {
	name: "広画面: RPE 既選択時に中央スクロールで開く",
	globals: { viewport: { value: "desktop" } },
	args: {
		pattern: { kind: "weight-x-rpe", weight: 100, rpe: 8 },
	},
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

export const DesktopEditingFromEmpty: Story = {
	name: "広画面: 値未入力から編集開始",
	globals: { viewport: { value: "desktop" } },
	args: {
		pattern: null,
	},
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
		await userEvent.click(weightInput);
		await userEvent.keyboard("80");
		const repsInput = findInputByLabel("回数");
		await userEvent.click(repsInput);
		await userEvent.keyboard("10");
		await userEvent.click(requireButtonInDialogByName("確定"));
		await waitFor(() => {
			expect(args.onChange).toHaveBeenCalledWith({
				kind: "weight-x-reps",
				weight: 80,
				reps: 10,
			});
		});
	},
};

export const MobileEditingSubmitByConfirmButton: Story = {
	name: "狭画面: Drawer で確定",
	globals: { viewport: { value: "mobile" } },
	args: {
		index: 2,
		pattern: { kind: "weight-x-reps", weight: 100, reps: 5 },
	},
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
		await userEvent.keyboard("110");
		await userEvent.click(requireButtonInDialogByName("確定"));
		await waitFor(() => {
			expect(args.onChange).toHaveBeenCalledWith({
				kind: "weight-x-reps",
				weight: 110,
				reps: 5,
			});
		});
	},
};

export const MobileEditingCancelByCloseButton: Story = {
	name: "狭画面: Drawer の × ボタンでキャンセル",
	globals: { viewport: { value: "mobile" } },
	args: {
		pattern: { kind: "weight-x-reps", weight: 100, reps: 5 },
	},
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
		await userEvent.keyboard("999");
		await userEvent.click(requireButtonInDialogByName("閉じる"));
		await waitFor(() => {
			expect(findEditDialog()).toBeNull();
		});
		expect(args.onChange).not.toHaveBeenCalled();
	},
};

export const MobileEditingPatternSwitch: Story = {
	name: "狭画面: Drawer でパターン切替",
	globals: { viewport: { value: "mobile" } },
	args: {
		pattern: { kind: "weight-x-reps", weight: 100, reps: 5 },
	},
	render: (args) => <StatefulRow {...args} />,
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await userEvent.click(
			canvas.getByRole("button", { name: "ベンチプレス 1セット目を編集" }),
		);
		await waitFor(() => {
			expect(findEditDialog()).not.toBeNull();
		});
		await userEvent.click(requireButtonInDialogByName(/^パターンを変更/));
		await waitFor(() => {
			expect(findMenuItemByName("回数 × RPE")).toBeDefined();
		});
		const menuItem = findMenuItemByName("回数 × RPE");
		if (menuItem === undefined) throw new Error("menu item not found");
		await userEvent.click(menuItem);
		await waitFor(() => {
			expect(findInputByLabel("回数")).toBeDefined();
			expect(findButtonInDialogByName("8")).toBeDefined();
		});
	},
};

const StatefulRow: FC<ComponentProps<typeof SetPlanRow>> = ({
	pattern: initialPattern,
	onChange,
	...rest
}) => {
	const [pattern, setPattern] = useState<SetPlanPattern | null>(initialPattern);
	const handleChange = (next: SetPlanPattern) => {
		setPattern(next);
		onChange(next);
	};
	return <SetPlanRow {...rest} pattern={pattern} onChange={handleChange} />;
};

const findEditDialog = (): HTMLElement | null =>
	document.querySelector<HTMLElement>('[role="dialog"]');

const requireEditDialog = (): HTMLElement => {
	const dialog = findEditDialog();
	if (dialog === null) throw new Error("edit dialog not found");
	return dialog;
};

const findButtonInDialogByName = (
	name: string | RegExp,
): HTMLElement | undefined =>
	Array.from(
		requireEditDialog().querySelectorAll<HTMLButtonElement>("button"),
	).find((el) => {
		const elName =
			el.getAttribute("aria-label") ?? el.textContent?.trim() ?? "";
		return typeof name === "string" ? elName === name : name.test(elName);
	});

const requireButtonInDialogByName = (name: string | RegExp): HTMLElement => {
	const el = findButtonInDialogByName(name);
	if (el === undefined)
		throw new Error(`button with name "${name}" not found in edit dialog`);
	return el;
};

const findInputByLabel = (label: string): HTMLInputElement => {
	const dialog = requireEditDialog();
	const labelEl = Array.from(
		dialog.querySelectorAll<HTMLElement>("label"),
	).find((l) => l.textContent === label);
	if (labelEl === undefined) throw new Error(`label "${label}" not found`);
	const id = labelEl.getAttribute("for");
	if (id === null) throw new Error(`label "${label}" has no associated input`);
	const input = dialog.querySelector<HTMLInputElement>(`#${CSS.escape(id)}`);
	if (input === null) throw new Error(`input for label "${label}" not found`);
	return input;
};

const findMenuItemByName = (name: string): HTMLElement | undefined =>
	Array.from(
		document.querySelectorAll<HTMLElement>(
			'[role="menuitem"], [role="menuitemradio"]',
		),
	).find((el) => (el.textContent ?? "").replace(/\s+/g, " ").trim() === name);
