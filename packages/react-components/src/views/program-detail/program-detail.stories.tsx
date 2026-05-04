import type { Meta, StoryObj } from "@storybook/react";
import type { ComponentProps } from "react";
import { fn } from "storybook/test";
import { PageSection } from "../../primitives/page-section";
import { ProgramDetail } from "./program-detail";

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

const AVAILABLE_EXERCISES: ComponentProps<
	typeof ProgramDetail
>["availableExercises"] = [
	{ id: "ex-bench", name: "ベンチプレス" },
	{ id: "ex-incline-db", name: "インクラインダンベルプレス" },
	{ id: "ex-pushdown", name: "トライセプスプッシュダウン" },
	{ id: "ex-squat", name: "バックスクワット" },
	{ id: "ex-deadlift", name: "デッドリフト" },
	{ id: "ex-row", name: "ベントオーバーロウ" },
	{ id: "ex-pulldown", name: "ラットプルダウン" },
	{ id: "ex-shoulder-press", name: "ショルダープレス" },
	{ id: "ex-leg-press", name: "レッグプレス" },
	{ id: "ex-leg-curl", name: "レッグカール" },
];

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
		availableExercises: AVAILABLE_EXERCISES,
		onAddDay: fn(),
		onSelectExercise: fn(),
	},
	decorators: [
		(Story) => (
			<PageSection width="wide">
				<Story />
			</PageSection>
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
// V16 → V17 → V2 のフロー直後に V2 が表示する想定の状態。
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

// 既存の Day に種目未選択の行を追加した中間状態。
// 設計判断 #57 に基づき、種目未選択時は ExerciseSelector で picker を表示する。
const DAYS_WITH_UNSELECTED: Day[] = [
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
				],
			},
			{
				id: "ep-d1-new",
				exercise: null,
				setPlans: [
					{ id: "sp-d1-new-1", params: null },
					{ id: "sp-d1-new-2", params: null },
				],
			},
		],
	},
];

export const ExerciseSelectorVisible: Story = {
	name: "種目未選択（picker 表示）",
	args: {
		name: "5/3/1 BBB",
		meta: null,
		days: DAYS_WITH_UNSELECTED,
		defaultSelectedDayId: "d1",
	},
};

export const ExerciseSelectorVisibleMobile: Story = {
	name: "種目未選択 (Mobile / Drawer)",
	args: {
		name: "5/3/1 BBB",
		meta: null,
		days: DAYS_WITH_UNSELECTED,
		defaultSelectedDayId: "d1",
	},
	globals: {
		viewport: { value: "mobile" },
	},
};

export const ExerciseSelectorVisibleDesktop: Story = {
	name: "種目未選択 (Desktop / Popover)",
	args: {
		name: "5/3/1 BBB",
		meta: null,
		days: DAYS_WITH_UNSELECTED,
		defaultSelectedDayId: "d1",
	},
	globals: {
		viewport: { value: "desktop" },
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
