import type { Meta, StoryObj } from "@storybook/react";
import type { ComponentProps, FC } from "react";
import { useState } from "react";
import { expect, fn, screen, userEvent, waitFor, within } from "storybook/test";
import { SetPlanSection } from ".";

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
		onChangeSetPlan: fn(),
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
	name: "セット計画 複数件",
	args: { setPlans: SAMPLE_SET_PLANS },
};

export const Empty: Story = {
	name: "セット計画ゼロ件",
	args: { setPlans: [] },
};

export const QuickAddLabelWeightReps: Story = {
	name: "クイック追加ラベル: 直前が weight-reps",
	args: {
		setPlans: [{ id: "sp-1", pattern: "weight-reps", weight: 100, reps: 5 }],
	},
};

export const QuickAddLabelRepsRpe: Story = {
	name: "クイック追加ラベル: 直前が reps-rpe",
	args: {
		setPlans: [{ id: "sp-1", pattern: "reps-rpe", reps: 12, rpe: 8 }],
	},
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

export const AddFromEmptyWiresUpOnAdd: Story = {
	name: "セット計画ゼロ件のとき、Trigger から dialog を開いて確定すると onAddSetPlan が呼ばれる",
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
		await userEvent.keyboard("60");
		await userEvent.tripleClick(repsInput);
		await userEvent.keyboard("10");
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

const StatefulSection: FC<ComponentProps<typeof SetPlanSection>> = ({
	setPlans: initial,
	onChangeSetPlan,
	onAddSetPlan,
	onDeleteSetPlan,
	...rest
}) => {
	const [setPlans, setSetPlans] = useState<SetPlan[]>(initial);
	const handleChange: ComponentProps<typeof SetPlanSection>["onChangeSetPlan"] =
		(id, payload) => {
			setSetPlans((prev) =>
				prev.map((sp) => (sp.id === id ? { id, ...payload } : sp)),
			);
			onChangeSetPlan(id, payload);
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
			onChangeSetPlan={handleChange}
			onAddSetPlan={handleAdd}
			onDeleteSetPlan={handleDelete}
		/>
	);
};
