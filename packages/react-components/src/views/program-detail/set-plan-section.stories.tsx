import type { Meta, StoryObj } from "@storybook/react";
import type { ComponentProps, FC } from "react";
import { useState } from "react";
import { expect, fn, screen, userEvent, waitFor, within } from "storybook/test";
import { SetPlanSection } from "./set-plan-section";

type SetPlan = ComponentProps<typeof SetPlanSection>["setPlans"][number];
type AddPayload = Parameters<
	ComponentProps<typeof SetPlanSection>["onAddSetPlan"]
>[0];

const meta = {
	title: "View/V2 プログラム詳細/SetPlanSection",
	component: SetPlanSection,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
	args: {
		weightUnit: "kg",
		weightStep: 2.5,
		exerciseName: "ベンチプレス",
		onSetPlanChange: fn(),
		onAddSetPlan: fn(),
		onDeleteSetPlan: fn(),
	},
	render: (args) => <StatefulSection {...args} />,
	decorators: [
		(Story) => (
			<div className="w-96">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof SetPlanSection>;

export default meta;
type Story = StoryObj<typeof meta>;

const SAMPLE_SET_PLANS: SetPlan[] = [
	{ id: "sp-1", pattern: "weight-reps", weight: 100, reps: 5 },
	{ id: "sp-2", pattern: "weight-reps", weight: 100, reps: 5 },
	{ id: "sp-3", pattern: "weight-rpe", weight: 100, rpe: 9 },
];

export const Default: Story = {
	args: { setPlans: SAMPLE_SET_PLANS },
};

export const Empty: Story = {
	name: "セット計画ゼロ件",
	args: { setPlans: [] },
};

export const QuickAddInheritsFromLastSet: Story = {
	name: "直前セットがあるとき、ダイアログを開かず前値を継承して 1 タップで追加",
	args: { setPlans: SAMPLE_SET_PLANS },
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		// 直前 (sp-3: weight-rpe, 100kg, RPE 9) の値をラベルに埋めたボタンが出る。
		// アクセシブル名にはインデックス (#4) も含まれるので部分一致で照合
		await userEvent.click(
			canvas.getByRole("button", { name: /100kg @ RPE 9を追加/ }),
		);
		// ダイアログは開かず、直接 onAdd が呼ばれる
		expect(screen.queryByRole("dialog")).toBeNull();
		await waitFor(() => {
			expect(args.onAddSetPlan).toHaveBeenCalledWith({
				pattern: "weight-rpe",
				weight: 100,
				rpe: 9,
			});
		});
	},
};

export const AddFromEmptyRequiresInput: Story = {
	name: "セット計画ゼロ件のとき、初期値なしで値を入力して追加",
	args: { setPlans: [] },
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		await userEvent.click(canvas.getByRole("button", { name: "セットを追加" }));
		const dialog = await screen.findByRole("dialog");
		// 直前セットなし → 値未入力で disabled
		expect(within(dialog).getByRole("button", { name: /確定/ })).toBeDisabled();
		const weightInput = within(dialog).getByRole("textbox", {
			name: "重量 (kg)",
		});
		const repsInput = within(dialog).getByRole("textbox", { name: "回数" });
		await userEvent.tripleClick(weightInput);
		await userEvent.keyboard("60");
		await userEvent.tripleClick(repsInput);
		await userEvent.keyboard("10");
		await userEvent.tab();
		await userEvent.click(within(dialog).getByRole("button", { name: /確定/ }));
		await waitFor(() => {
			expect(args.onAddSetPlan).toHaveBeenCalledWith({
				pattern: "weight-reps",
				weight: 60,
				reps: 10,
			});
		});
	},
};

export const AddEscapeDiscards: Story = {
	name: "ダイアログを Escape で閉じると追加されない",
	args: { setPlans: [] },
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		await userEvent.click(canvas.getByRole("button", { name: "セットを追加" }));
		await screen.findByRole("dialog");
		await userEvent.keyboard("{Escape}");
		await waitFor(() => {
			expect(screen.queryByRole("dialog")).toBeNull();
		});
		expect(args.onAddSetPlan).not.toHaveBeenCalled();
	},
};

export const CommitWithoutBlurPersistsLatestValue: Story = {
	name: "入力後 blur せずに確定ボタンを押しても最新値が commit される",
	args: { setPlans: [] },
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		await userEvent.click(canvas.getByRole("button", { name: "セットを追加" }));
		const dialog = await screen.findByRole("dialog");
		const weightInput = within(dialog).getByRole("textbox", {
			name: "重量 (kg)",
		});
		const repsInput = within(dialog).getByRole("textbox", { name: "回数" });
		await userEvent.tripleClick(weightInput);
		await userEvent.keyboard("80");
		await userEvent.tripleClick(repsInput);
		await userEvent.keyboard("10");
		// blur せずに直接「確定」ボタンを押す
		await userEvent.click(within(dialog).getByRole("button", { name: /確定/ }));
		await waitFor(() => {
			expect(args.onAddSetPlan).toHaveBeenCalledWith({
				pattern: "weight-reps",
				weight: 80,
				reps: 10,
			});
		});
	},
};

export const DeleteSetPlan: Story = {
	name: "Row の削除ボタンで削除",
	args: { setPlans: SAMPLE_SET_PLANS },
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		await userEvent.click(
			canvas.getByRole("button", {
				name: "ベンチプレス 2セット目を削除",
			}),
		);
		await waitFor(() => {
			expect(args.onDeleteSetPlan).toHaveBeenCalledWith("sp-2");
		});
	},
};

const StatefulSection: FC<ComponentProps<typeof SetPlanSection>> = ({
	setPlans: initial,
	onSetPlanChange,
	onAddSetPlan,
	onDeleteSetPlan,
	...rest
}) => {
	const [setPlans, setSetPlans] = useState<SetPlan[]>(initial);
	const handleChange: ComponentProps<typeof SetPlanSection>["onSetPlanChange"] =
		(id, payload) => {
			setSetPlans((prev) =>
				prev.map((sp) => (sp.id === id ? { id, ...payload } : sp)),
			);
			onSetPlanChange(id, payload);
		};
	const handleAdd = (payload: AddPayload) => {
		const id = `sp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
		setSetPlans((prev) => [...prev, { id, ...payload }]);
		onAddSetPlan(payload);
	};
	const handleDelete = (id: string) => {
		setSetPlans((prev) => prev.filter((sp) => sp.id !== id));
		onDeleteSetPlan(id);
	};
	return (
		<SetPlanSection
			{...rest}
			setPlans={setPlans}
			onSetPlanChange={handleChange}
			onAddSetPlan={handleAdd}
			onDeleteSetPlan={handleDelete}
		/>
	);
};
