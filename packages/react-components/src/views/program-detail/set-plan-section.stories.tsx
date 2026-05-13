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

export const AddInheritsFromLastSet: Story = {
	name: "直前セットの kind と値を初期値として継承して追加できる",
	args: { setPlans: SAMPLE_SET_PLANS },
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		// 「セットを追加」アフォーダンスを押すとダイアログが開く
		await userEvent.click(canvas.getByRole("button", { name: "セットを追加" }));
		await waitFor(() => {
			expect(findEditDialog()).not.toBeNull();
		});
		// 直前 (sp-3: weight-x-rpe, 100kg, RPE 9) が初期値に。そのまま確定で同じ値が追加される
		await userEvent.click(requireButtonInDialogByName(/確定/));
		await waitFor(() => {
			expect(args.onAddSetPlan).toHaveBeenCalledWith({
				pattern: "weight-x-rpe",
				weight: 100,
				rpe: 9,
			});
		});
		await waitFor(() => {
			expect(findEditDialog()).toBeNull();
		});
	},
};

export const AddSwitchPatternFromLastSet: Story = {
	name: "タブで kind を切り替えて値を入れて追加",
	args: { setPlans: SAMPLE_SET_PLANS },
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		await userEvent.click(canvas.getByRole("button", { name: "セットを追加" }));
		await waitFor(() => {
			expect(findEditDialog()).not.toBeNull();
		});
		// 直前は weight-x-rpe だが、回数×RPE に切り替えて追加する
		await userEvent.click(requireTabInDialogByName("回数×RPE"));
		const repsInput = findInputByLabel("回数");
		await userEvent.tripleClick(repsInput);
		await userEvent.keyboard("12");
		await userEvent.click(requireButtonInDialogByName("8"));
		await userEvent.click(requireButtonInDialogByName(/確定/));
		await waitFor(() => {
			expect(args.onAddSetPlan).toHaveBeenCalledWith({
				pattern: "reps-x-rpe",
				reps: 12,
				rpe: 8,
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
		await waitFor(() => {
			expect(findEditDialog()).not.toBeNull();
		});
		// 直前セットなし → 値未入力で disabled
		expect(requireButtonInDialogByName(/確定/)).toBeDisabled();
		const weightInput = findInputByLabel("重量 (kg)");
		const repsInput = findInputByLabel("回数");
		await userEvent.tripleClick(weightInput);
		await userEvent.keyboard("60");
		await userEvent.tripleClick(repsInput);
		await userEvent.keyboard("10");
		await userEvent.tab();
		await userEvent.click(requireButtonInDialogByName(/確定/));
		await waitFor(() => {
			expect(args.onAddSetPlan).toHaveBeenCalledWith({
				pattern: "weight-x-reps",
				weight: 60,
				reps: 10,
			});
		});
	},
};

export const AddEscapeDiscards: Story = {
	name: "ダイアログを Escape で閉じると追加されない",
	args: { setPlans: SAMPLE_SET_PLANS },
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		await userEvent.click(canvas.getByRole("button", { name: "セットを追加" }));
		await waitFor(() => {
			expect(findEditDialog()).not.toBeNull();
		});
		await userEvent.keyboard("{Escape}");
		await waitFor(() => {
			expect(findEditDialog()).toBeNull();
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
		await waitFor(() => {
			expect(findEditDialog()).not.toBeNull();
		});
		const weightInput = findInputByLabel("重量 (kg)");
		const repsInput = findInputByLabel("回数");
		await userEvent.tripleClick(weightInput);
		await userEvent.keyboard("80");
		await userEvent.tripleClick(repsInput);
		await userEvent.keyboard("10");
		// blur せずに直接「確定」ボタンを押す
		await userEvent.click(requireButtonInDialogByName(/確定/));
		await waitFor(() => {
			expect(args.onAddSetPlan).toHaveBeenCalledWith({
				pattern: "weight-x-reps",
				weight: 80,
				reps: 10,
			});
		});
	},
};

export const TabSwitchPreservesValues: Story = {
	name: "Tabs 切替で入力値が保持される（input にフォーカスが残ったまま切替）",
	args: { setPlans: [] },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await userEvent.click(canvas.getByRole("button", { name: "セットを追加" }));
		await waitFor(() => {
			expect(findEditDialog()).not.toBeNull();
		});
		// 重量×RPE タブで 100 を入力（Tab キーで blur せず、input にフォーカスを残したまま）
		await userEvent.click(requireTabInDialogByName("重量×RPE"));
		const weightInput = findInputByLabel("重量 (kg)");
		await userEvent.tripleClick(weightInput);
		await userEvent.keyboard("100");
		// blur せずにそのままタブをクリック（React Aria の Button preventDefault で
		// マウスクリックでは blur が発火しないため、ここで commit が漏れるバグの再現条件）
		await userEvent.click(requireTabInDialogByName("重量×回数"));
		const weightInRepsTab = findInputByLabel("重量 (kg)");
		expect(weightInRepsTab.value).toBe("100");
		// 重量×RPE へ戻る → やはり 100 が保持されているはず
		await userEvent.click(requireTabInDialogByName("重量×RPE"));
		const weightInRpeTab = findInputByLabel("重量 (kg)");
		expect(weightInRpeTab.value).toBe("100");
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
