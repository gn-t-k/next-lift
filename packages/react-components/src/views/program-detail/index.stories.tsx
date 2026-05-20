import type { Meta, StoryObj } from "@storybook/react";
import type { ComponentProps, FC } from "react";
import { useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { Main } from "../../primitives/main";
import { ProgramDetail } from ".";

type Day = ComponentProps<typeof ProgramDetail>["days"][number];
type ExercisePlan = Day["exercisePlans"][number];

const benchPress: ExercisePlan["exercise"] = {
	id: "ex-bench",
	name: "ベンチプレス",
	weightUnit: "kg",
	weightStep: 2.5,
};

const inclineDumbbell: ExercisePlan["exercise"] = {
	id: "ex-incline-db",
	name: "インクラインダンベルプレス",
	weightUnit: "kg",
	weightStep: 1,
};

const tricepsPushdown: ExercisePlan["exercise"] = {
	id: "ex-pushdown",
	name: "トライセプスプッシュダウン",
	weightUnit: "kg",
	weightStep: 2.5,
};

const squat: ExercisePlan["exercise"] = {
	id: "ex-squat",
	name: "バックスクワット",
	weightUnit: "kg",
	weightStep: 2.5,
};

const SAMPLE_DAYS: Day[] = [
	{
		id: "d1",
		label: "Day 1: 上半身プッシュ",
		detailHref: "/programs/p1/days/d1",
		exercisePlans: [
			{
				id: "ep-d1-bench",
				exercise: benchPress,
				setPlans: [
					{
						id: "sp-d1-bench-1",
						pattern: "weight-reps",
						weight: 100,
						reps: 5,
					},
					{
						id: "sp-d1-bench-2",
						pattern: "weight-reps",
						weight: 100,
						reps: 5,
					},
					{
						id: "sp-d1-bench-3",
						pattern: "weight-rpe",
						weight: 100,
						rpe: 9,
					},
				],
			},
			{
				id: "ep-d1-incline",
				exercise: inclineDumbbell,
				setPlans: [
					{
						id: "sp-d1-incline-1",
						pattern: "weight-reps",
						weight: 30,
						reps: 10,
					},
					{
						id: "sp-d1-incline-2",
						pattern: "weight-reps",
						weight: 30,
						reps: 10,
					},
				],
			},
			{
				id: "ep-d1-pushdown",
				exercise: tricepsPushdown,
				setPlans: [
					{
						id: "sp-d1-pushdown-1",
						pattern: "reps-rpe",
						reps: 12,
						rpe: 8,
					},
					{
						id: "sp-d1-pushdown-2",
						pattern: "reps-rpe",
						reps: 12,
						rpe: 8,
					},
				],
			},
		],
	},
	{
		id: "d2",
		label: "Day 2: 下半身",
		detailHref: "/programs/p1/days/d2",
		exercisePlans: [
			{
				id: "ep-d2-squat",
				exercise: squat,
				setPlans: [
					{
						id: "sp-d2-squat-1",
						pattern: "weight-reps",
						weight: 140,
						reps: 3,
					},
					{
						id: "sp-d2-squat-2",
						pattern: "weight-reps",
						weight: 140,
						reps: 3,
					},
					{
						id: "sp-d2-squat-3",
						pattern: "weight-reps",
						weight: 140,
						reps: 3,
					},
				],
			},
		],
	},
	{
		id: "d3",
		label: "Day 3: 上半身プル",
		detailHref: "/programs/p1/days/d3",
		exercisePlans: [],
	},
	{
		id: "d4",
		label: "Day 4: コンディショニング",
		detailHref: "/programs/p1/days/d4",
		exercisePlans: [],
	},
];

const meta = {
	title: "View/V2 プログラム詳細",
	component: ProgramDetail,
	parameters: {
		layout: "fullscreen",
	},
	tags: ["autodocs"],
	args: {
		defaultSelectedDayId: "d1",
		onAddDay: fn(),
		onAddExercisePlan: fn(),
		onDeleteExercisePlan: fn(),
		onChangeSetPlan: fn(),
		onAddSetPlan: fn(),
		onDeleteSetPlan: fn(),
	},
	decorators: [
		(Story) => (
			<Main width="wide">
				<Story />
			</Main>
		),
	],
} satisfies Meta<typeof ProgramDetail>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MultipleDays: Story = {
	args: {
		name: "5/3/1 BBB",
		meta: "メインリフトは 5/3/1 で、補助は BBB（Boring But Big）。\nDeload week は 4 週ごとに挿入する。",
		days: SAMPLE_DAYS,
	},
};

export const NoMeta: Story = {
	args: {
		name: "PPL Hypertrophy",
		meta: null,
		days: SAMPLE_DAYS,
	},
};

export const LongProgramName: Story = {
	args: {
		name: "Wendler 5/3/1 Boring But Big with Joker Sets and First Set Last AMRAP Conjugate Method (3-day split, 16-week mesocycle, deload weeks included) 詳細メソッド付きの上級者向け長期プログラム（完全版）",
		meta: "メインリフトは 5/3/1 で、補助は BBB（Boring But Big）。\nDeload week は 4 週ごとに挿入する。",
		days: SAMPLE_DAYS,
	},
};

// 種目計画追加直後の transient state（exercise: null + セット計画ゼロ件）。
// 設計判断 #68 で空セット placeholder は廃止し、種目計画追加直後はセット計画ゼロ件で
// 「セットを追加」アフォーダンスのみが見える状態になる。
// 種目選択 picker は本ビューには持たず、種目選択 UI 自体は種目計画追加タスク (2-3-12) で導入する想定。
export const AfterAddingExercisePlan: Story = {
	args: {
		name: "新しいプログラム",
		meta: null,
		days: [
			{
				id: "d1",
				label: "Day 1",
				detailHref: "/programs/p1/days/d1",
				exercisePlans: [
					{
						id: "ep-init",
						exercise: null,
						setPlans: [],
					},
				],
			},
		],
	},
};

export const Mobile: Story = {
	args: {
		name: "5/3/1 BBB",
		meta: "メインリフトは 5/3/1 で、補助は BBB（Boring But Big）。\nDeload week は 4 週ごとに挿入する。",
		days: SAMPLE_DAYS,
	},
	globals: {
		viewport: { value: "mobile" },
	},
};

export const Desktop: Story = {
	args: {
		name: "5/3/1 BBB",
		meta: "メインリフトは 5/3/1 で、補助は BBB（Boring But Big）。\nDeload week は 4 週ごとに挿入する。",
		days: SAMPLE_DAYS,
	},
	globals: {
		viewport: { value: "desktop" },
	},
};

export const NoDays: Story = {
	args: {
		name: "新しいプログラム",
		meta: null,
		days: [],
	},
};

export const NoDaysMobile: Story = {
	args: {
		name: "新しいプログラム",
		meta: null,
		days: [],
	},
	globals: {
		viewport: { value: "mobile" },
	},
};

export const NoDaysDesktop: Story = {
	args: {
		name: "新しいプログラム",
		meta: null,
		days: [],
	},
	globals: {
		viewport: { value: "desktop" },
	},
};

// 種目計画を全削除した後のエッジケース。設計判断 #61 により通常状態では発生しないが、
// 削除直後の transient state として ExercisePlanSection が CreateExercisePlanCard のみ表示する空状態。
export const NoExercisePlansInSelectedDay: Story = {
	args: {
		name: "新しいプログラム",
		meta: null,
		days: [
			{
				id: "d1",
				label: "Day 1",
				detailHref: "/programs/p1/days/d1",
				exercisePlans: [],
			},
		],
	},
};

export const AddExercisePlanInvokesCallback: Story = {
	name: "「種目計画を追加」を押すと onAddExercisePlan が選択中の dayId で呼ばれる",
	args: {
		name: "新しいプログラム",
		meta: null,
		days: [
			{
				id: "d1",
				label: "Day 1",
				detailHref: "/programs/p1/days/d1",
				exercisePlans: [],
			},
		],
	},
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		await userEvent.click(
			canvas.getByRole("button", { name: "種目計画を追加" }),
		);
		await waitFor(() => {
			expect(args.onAddExercisePlan).toHaveBeenCalledWith("d1");
		});
	},
};

// 設計判断 #71 の「初期構造の生成は consumer 責務」を story 上で再現するための stateful wrapper。
// 種目計画追加時は `exercise: null` + `setPlans: []` の初期構造を生成し、削除時は対象 id を除外する。
const StatefulProgramDetail: FC<ComponentProps<typeof ProgramDetail>> = ({
	days: initialDays,
	...rest
}) => {
	const [days, setDays] = useState(initialDays);

	const handleAddExercisePlan = (dayId: string) => {
		setDays((prev) =>
			prev.map((day) =>
				day.id === dayId
					? {
							...day,
							exercisePlans: [
								...day.exercisePlans,
								{
									id: crypto.randomUUID(),
									exercise: null,
									setPlans: [],
								},
							],
						}
					: day,
			),
		);
	};

	const handleDeleteExercisePlan = (exercisePlanId: string) => {
		setDays((prev) =>
			prev.map((day) => ({
				...day,
				exercisePlans: day.exercisePlans.filter(
					(exercisePlan) => exercisePlan.id !== exercisePlanId,
				),
			})),
		);
	};

	return (
		<ProgramDetail
			{...rest}
			days={days}
			onAddExercisePlan={handleAddExercisePlan}
			onDeleteExercisePlan={handleDeleteExercisePlan}
		/>
	);
};

export const ExercisePlanAddDeleteFlow: Story = {
	name: "種目計画の追加・削除を実体験できる",
	render: (args) => <StatefulProgramDetail {...args} />,
	args: {
		name: "新しいプログラム",
		meta: null,
		days: [
			{
				id: "d1",
				label: "Day 1",
				detailHref: "/programs/p1/days/d1",
				exercisePlans: [
					{
						id: "ep-d1-bench",
						exercise: benchPress,
						setPlans: [
							{
								id: "sp-d1-bench-1",
								pattern: "weight-reps",
								weight: 100,
								reps: 5,
							},
						],
					},
				],
			},
		],
	},
};

export const DeleteExercisePlanInvokesCallback: Story = {
	name: "削除ボタンを押すと onDeleteExercisePlan が対象 id で呼ばれる",
	args: {
		name: "5/3/1 BBB",
		meta: null,
		days: [
			{
				id: "d1",
				label: "Day 1",
				detailHref: "/programs/p1/days/d1",
				exercisePlans: [
					{
						id: "ep-d1-bench",
						exercise: benchPress,
						setPlans: [
							{
								id: "sp-d1-bench-1",
								pattern: "weight-reps",
								weight: 100,
								reps: 5,
							},
						],
					},
				],
			},
		],
	},
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		await userEvent.click(
			canvas.getByRole("button", { name: "ベンチプレスを削除" }),
		);
		await waitFor(() => {
			expect(args.onDeleteExercisePlan).toHaveBeenCalledWith("ep-d1-bench");
		});
	},
};
