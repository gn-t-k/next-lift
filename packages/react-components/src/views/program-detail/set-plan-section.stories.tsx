import type { Meta, StoryObj } from "@storybook/react";
import type { ComponentProps, FC } from "react";
import { useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import {
	findEditDialog,
	findInputByLabel,
	requireButtonInDialogByName,
	requireTabInDialogByName,
} from "./set-plan-row/stories-test-utils";
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
	{ id: "sp-1", pattern: "weight-x-reps", weight: 100, reps: 5 },
	{ id: "sp-2", pattern: "weight-x-reps", weight: 100, reps: 5 },
	{ id: "sp-3", pattern: "weight-x-rpe", weight: 100, rpe: 9 },
];

export const Default: Story = {
	args: { setPlans: SAMPLE_SET_PLANS },
};

export const Empty: Story = {
	name: "セット計画ゼロ件",
	args: { setPlans: [] },
};

export const InheritsFromLastSetOnAdd: Story = {
	name: "プレビューをタップで直前セットの値+パターンを継承して追加",
	args: { setPlans: SAMPLE_SET_PLANS },
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		await userEvent.click(
			canvas.getByRole("button", {
				name: "ベンチプレス 4セット目を追加",
			}),
		);
		await waitFor(() => {
			expect(args.onAddSetPlan).toHaveBeenCalledWith({
				pattern: "weight-x-rpe",
				weight: 100,
				rpe: 9,
			});
		});
	},
};

export const AddFromEmptyUsesDefault: Story = {
	name: "セット計画ゼロ件のとき weight-x-reps 既定で追加",
	args: { setPlans: [] },
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		await userEvent.click(
			canvas.getByRole("button", {
				name: "ベンチプレス 1セット目を追加",
			}),
		);
		await waitFor(() => {
			expect(args.onAddSetPlan).toHaveBeenCalledWith({
				pattern: "weight-x-reps",
				weight: 0,
				reps: 0,
			});
		});
	},
};

export const CyclePatternAndAdd: Story = {
	name: "↔ボタンでパターンを切り替えてから追加",
	args: { setPlans: SAMPLE_SET_PLANS },
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		const cycle = canvas.getByRole("button", {
			name: /追加するセットのパターンを切り替え/,
		});
		// 初期は直前と同じ weight-x-rpe。1 回押すと reps-x-rpe へ
		await userEvent.click(cycle);
		await userEvent.click(
			canvas.getByRole("button", {
				name: "ベンチプレス 4セット目を追加",
			}),
		);
		await waitFor(() => {
			expect(args.onAddSetPlan).toHaveBeenCalledWith({
				pattern: "reps-x-rpe",
				reps: 0,
				rpe: 8,
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

export const EmptyRowFillsAndBecomesNormalRow: Story = {
	name: "Empty Row で種類と値を入れて確定すると通常 Row に切り替わる",
	args: {
		setPlans: [{ id: "sp-empty", pattern: null }],
	},
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		// 初期: Empty Row が表示され、追加ボタンは Empty があるため非表示
		expect(
			canvas.queryByRole("button", { name: "ベンチプレス 2セット目を追加" }),
		).toBeNull();
		expect(
			canvas.queryByRole("button", { name: "ベンチプレス 1セット目を追加" }),
		).toBeNull();
		// 編集ボタンで Popover/Drawer を開く
		await userEvent.click(
			canvas.getByRole("button", { name: "ベンチプレス 1セット目を編集" }),
		);
		await waitFor(() => {
			expect(findEditDialog()).not.toBeNull();
		});
		// タブを「重量×RPE」に切り替えて値を入力
		await userEvent.click(requireTabInDialogByName("重量×RPE"));
		const weightInput = findInputByLabel("重量 (kg)");
		await userEvent.tripleClick(weightInput);
		await userEvent.keyboard("100");
		await userEvent.click(requireButtonInDialogByName("9"));
		await userEvent.click(requireButtonInDialogByName(/確定/));
		// onSetPlanChange が入力済み値で呼ばれる
		await waitFor(() => {
			expect(args.onSetPlanChange).toHaveBeenCalledWith("sp-empty", {
				pattern: "weight-x-rpe",
				weight: 100,
				rpe: 9,
			});
		});
		// state 更新後、Empty Row が通常の Row（編集ボタン付き）に置き換わる
		await waitFor(() => {
			expect(
				canvas.getByRole("button", {
					name: "ベンチプレス 1セット目を編集",
				}),
			).toBeInTheDocument();
		});
		// Empty が解消されたので追加ボタンが現れる（2 セット目）
		await waitFor(() => {
			expect(
				canvas.getByRole("button", { name: "ベンチプレス 2セット目を追加" }),
			).toBeInTheDocument();
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
