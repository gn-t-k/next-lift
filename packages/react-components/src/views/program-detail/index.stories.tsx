import type { Meta, StoryObj } from "@storybook/react";
import type { ComponentProps } from "react";
import { fn } from "storybook/test";
import { Main } from "../../primitives/main";
import { ProgramDetail } from ".";

type Day = ComponentProps<typeof ProgramDetail>["days"][number];
type ExercisePlan = Day["exercisePlans"][number];

const benchPress: ExercisePlan["exercise"] = {
	id: "ex-bench",
	name: "ベンチプレス",
	weightUnit: "kg",
};

const inclineDumbbell: ExercisePlan["exercise"] = {
	id: "ex-incline-db",
	name: "インクラインダンベルプレス",
	weightUnit: "kg",
};

const tricepsPushdown: ExercisePlan["exercise"] = {
	id: "ex-pushdown",
	name: "トライセプスプッシュダウン",
	weightUnit: "kg",
};

const squat: ExercisePlan["exercise"] = {
	id: "ex-squat",
	name: "バックスクワット",
	weightUnit: "kg",
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
						params: { pattern: "weight-x-reps", weight: 100, reps: 5 },
					},
					{
						id: "sp-d1-bench-2",
						params: { pattern: "weight-x-reps", weight: 100, reps: 5 },
					},
					{
						id: "sp-d1-bench-3",
						params: { pattern: "weight-x-rpe", weight: 100, rpe: 9 },
					},
				],
			},
			{
				id: "ep-d1-incline",
				exercise: inclineDumbbell,
				setPlans: [
					{
						id: "sp-d1-incline-1",
						params: { pattern: "weight-x-reps", weight: 30, reps: 10 },
					},
					{
						id: "sp-d1-incline-2",
						params: { pattern: "weight-x-reps", weight: 30, reps: 10 },
					},
				],
			},
			{
				id: "ep-d1-pushdown",
				exercise: tricepsPushdown,
				setPlans: [
					{
						id: "sp-d1-pushdown-1",
						params: { pattern: "reps-x-rpe", reps: 12, rpe: 8 },
					},
					{
						id: "sp-d1-pushdown-2",
						params: { pattern: "reps-x-rpe", reps: 12, rpe: 8 },
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
						params: { pattern: "weight-x-reps", weight: 140, reps: 3 },
					},
					{
						id: "sp-d2-squat-2",
						params: { pattern: "weight-x-reps", weight: 140, reps: 3 },
					},
					{
						id: "sp-d2-squat-3",
						params: { pattern: "weight-x-reps", weight: 140, reps: 3 },
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

// 設計判断 #58 によりアプリ層が初期構造（Day×1 + 種目計画×1（種目未確定） + セット計画×1（params: null））を渡す。
// プログラム新規作成 → Day新規作成 → プログラム詳細 のフロー直後を表示する想定の状態。
// 種目選択 picker は本ビューには持たず、種目選択 UI 自体はプログラム新規作成・Day 新規作成・種目計画追加タスクで導入する想定。
export const InitialStateAfterCreation: Story = {
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
						setPlans: [{ id: "sp-init", params: null }],
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
