import type { Meta, StoryObj } from "@storybook/react";
import type { ComponentProps, FC } from "react";
import { useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { SetPlanRow } from "./set-plan-row";

type Params = NonNullable<ComponentProps<typeof SetPlanRow>["params"]>;

const StatefulRow: FC<ComponentProps<typeof SetPlanRow>> = ({
	params: initialParams,
	onChange,
	...rest
}) => {
	const [params, setParams] = useState<Params | null>(initialParams);
	const handleChange = (next: Params) => {
		setParams(next);
		onChange?.(next);
	};
	return <SetPlanRow {...rest} params={params} onChange={handleChange} />;
};

const findMenuItemByName = (name: string): HTMLElement | undefined =>
	Array.from(document.querySelectorAll<HTMLElement>('[role="menuitem"]')).find(
		(el) => el.textContent?.trim() === name,
	);

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

export const WeightXReps: Story = {
	args: {
		params: { pattern: "weight-x-reps", weight: 100, reps: 5 },
	},
};

export const WeightXRepsLbs: Story = {
	args: {
		weightUnit: "lbs",
		params: { pattern: "weight-x-reps", weight: 225, reps: 5 },
	},
};

export const WeightXRpe: Story = {
	args: {
		params: { pattern: "weight-x-rpe", weight: 100, rpe: 9 },
	},
};

export const RepsXRpe: Story = {
	args: {
		params: { pattern: "reps-x-rpe", reps: 12, rpe: 8 },
	},
};

export const Empty: Story = {
	args: {
		params: null,
	},
};

export const HigherIndex: Story = {
	args: {
		index: 5,
		params: { pattern: "weight-x-reps", weight: 100, reps: 5 },
	},
};

export const Editable: Story = {
	args: {
		params: { pattern: "weight-x-reps", weight: 100, reps: 5 },
		onChange: fn(),
	},
	render: (args) => <StatefulRow {...args} />,
};

export const EditingSubmitByEnter: Story = {
	args: {
		params: { pattern: "weight-x-reps", weight: 100, reps: 5 },
		onChange: fn(),
	},
	render: (args) => <StatefulRow {...args} />,
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		await userEvent.click(
			canvas.getByRole("button", { name: "セット 1 を編集" }),
		);
		const weightInput = await canvas.findByRole("textbox", {
			name: "重量 (kg)",
		});
		await userEvent.tripleClick(weightInput);
		await userEvent.keyboard("110{Enter}");
		await waitFor(() => {
			expect(args.onChange).toHaveBeenCalledWith({
				pattern: "weight-x-reps",
				weight: 110,
				reps: 5,
			});
		});
	},
};

export const EditingSubmitByCheckIcon: Story = {
	args: {
		params: { pattern: "weight-x-reps", weight: 100, reps: 5 },
		onChange: fn(),
	},
	render: (args) => <StatefulRow {...args} />,
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		await userEvent.click(
			canvas.getByRole("button", { name: "セット 1 を編集" }),
		);
		const repsInput = await canvas.findByRole("textbox", { name: "回数" });
		await userEvent.tripleClick(repsInput);
		await userEvent.keyboard("8");
		await userEvent.click(canvas.getByRole("button", { name: "確定" }));
		await waitFor(() => {
			expect(args.onChange).toHaveBeenCalledWith({
				pattern: "weight-x-reps",
				weight: 100,
				reps: 8,
			});
		});
	},
};

export const EditingCancelByEscape: Story = {
	args: {
		params: { pattern: "weight-x-reps", weight: 100, reps: 5 },
		onChange: fn(),
	},
	render: (args) => <StatefulRow {...args} />,
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		await userEvent.click(
			canvas.getByRole("button", { name: "セット 1 を編集" }),
		);
		const weightInput = await canvas.findByRole("textbox", {
			name: "重量 (kg)",
		});
		await userEvent.tripleClick(weightInput);
		await userEvent.keyboard("999");
		await userEvent.keyboard("{Escape}");
		await waitFor(() => {
			expect(canvas.queryByRole("form")).not.toBeInTheDocument();
		});
		expect(args.onChange).not.toHaveBeenCalled();
	},
};

export const EditingCancelByXIcon: Story = {
	args: {
		params: { pattern: "weight-x-reps", weight: 100, reps: 5 },
		onChange: fn(),
	},
	render: (args) => <StatefulRow {...args} />,
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		await userEvent.click(
			canvas.getByRole("button", { name: "セット 1 を編集" }),
		);
		const weightInput = await canvas.findByRole("textbox", {
			name: "重量 (kg)",
		});
		await userEvent.tripleClick(weightInput);
		await userEvent.keyboard("999");
		await userEvent.click(canvas.getByRole("button", { name: "キャンセル" }));
		await waitFor(() => {
			expect(canvas.queryByRole("form")).not.toBeInTheDocument();
		});
		expect(args.onChange).not.toHaveBeenCalled();
	},
};

export const EditingBlurDoesNothing: Story = {
	args: {
		params: { pattern: "weight-x-reps", weight: 100, reps: 5 },
		onChange: fn(),
	},
	render: (args) => (
		<div className="flex flex-col gap-4">
			<StatefulRow {...args} />
			<input
				type="text"
				placeholder="フォーカス先"
				aria-label="外部入力"
				className="rounded border border-border p-2"
			/>
		</div>
	),
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		await userEvent.click(
			canvas.getByRole("button", { name: "セット 1 を編集" }),
		);
		const weightInput = await canvas.findByRole("textbox", {
			name: "重量 (kg)",
		});
		await userEvent.tripleClick(weightInput);
		await userEvent.keyboard("120");
		await userEvent.click(canvas.getByRole("textbox", { name: "外部入力" }));
		expect(canvas.getByRole("form")).toBeInTheDocument();
		expect(args.onChange).not.toHaveBeenCalled();
	},
};

export const EditingPatternSwitchClearsValues: Story = {
	args: {
		params: { pattern: "weight-x-reps", weight: 100, reps: 5 },
		onChange: fn(),
	},
	render: (args) => <StatefulRow {...args} />,
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await userEvent.click(
			canvas.getByRole("button", { name: "セット 1 を編集" }),
		);
		await userEvent.click(canvas.getByRole("button", { name: /^重量 × 回数/ }));
		await waitFor(() => {
			expect(findMenuItemByName("重量 × RPE")).toBeDefined();
		});
		const menuItem = findMenuItemByName("重量 × RPE");
		if (menuItem === undefined) throw new Error("menu item not found");
		await userEvent.click(menuItem);
		const weightInput = await canvas.findByRole("textbox", {
			name: "重量 (kg)",
		});
		const rpeInput = await canvas.findByRole("textbox", { name: "RPE" });
		expect(weightInput).toHaveValue("");
		expect(rpeInput).toHaveValue("");
		expect(canvas.getByRole("button", { name: "確定" })).toBeDisabled();
	},
};

export const EditingFromEmpty: Story = {
	args: {
		params: null,
		onChange: fn(),
	},
	render: (args) => <StatefulRow {...args} />,
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		await userEvent.click(
			canvas.getByRole("button", { name: "セット 1 を編集" }),
		);
		const weightInput = await canvas.findByRole("textbox", {
			name: "重量 (kg)",
		});
		await userEvent.click(weightInput);
		await userEvent.keyboard("80");
		const repsInput = await canvas.findByRole("textbox", { name: "回数" });
		await userEvent.click(repsInput);
		await userEvent.keyboard("10");
		await userEvent.click(canvas.getByRole("button", { name: "確定" }));
		await waitFor(() => {
			expect(args.onChange).toHaveBeenCalledWith({
				pattern: "weight-x-reps",
				weight: 80,
				reps: 10,
			});
		});
	},
};
