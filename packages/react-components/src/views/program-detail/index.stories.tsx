import type { Meta, StoryObj } from "@storybook/react";
import type { ComponentProps, FC } from "react";
import { useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { Main } from "../../primitives/main";
import { ProgramDetail } from ".";

type Day = ComponentProps<typeof ProgramDetail>["days"][number];
type ExercisePlan = Day["exercisePlans"][number];
type AvailableExercise = ComponentProps<
	typeof ProgramDetail
>["availableExercises"][number];

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

const squat: ExercisePlan["exercise"] = {
	id: "ex-squat",
	name: "バックスクワット",
	weightUnit: "kg",
	weightStep: 2.5,
};

const SAMPLE_AVAILABLE_EXERCISES: AvailableExercise[] = [
	{ id: "ex-bench", name: "ベンチプレス" },
	{ id: "ex-incline-db", name: "インクラインダンベルプレス" },
	{ id: "ex-squat", name: "バックスクワット" },
	{ id: "ex-deadlift", name: "デッドリフト" },
	{ id: "ex-overhead-press", name: "オーバーヘッドプレス" },
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
		availableExercises: SAMPLE_AVAILABLE_EXERCISES,
		onAddDay: fn(),
		onAddExercisePlanWithSelectedExercise: fn(),
		onAddExercisePlanWithNewExercise: fn(),
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
	name: "複数 Day",
	args: {
		name: "5/3/1 BBB",
		meta: "メインリフトは 5/3/1 で、補助は BBB（Boring But Big）。\nDeload week は 4 週ごとに挿入する。",
		days: SAMPLE_DAYS,
	},
};

export const NoMeta: Story = {
	name: "meta なし",
	args: {
		name: "PPL Hypertrophy",
		meta: null,
		days: SAMPLE_DAYS,
	},
};

export const LongProgramName: Story = {
	name: "長いプログラム名",
	args: {
		name: "Wendler 5/3/1 Boring But Big with Joker Sets and First Set Last AMRAP Conjugate Method (3-day split, 16-week mesocycle, deload weeks included) 詳細メソッド付きの上級者向け長期プログラム（完全版）",
		meta: "メインリフトは 5/3/1 で、補助は BBB（Boring But Big）。\nDeload week は 4 週ごとに挿入する。",
		days: SAMPLE_DAYS,
	},
};

export const NoDays: Story = {
	name: "Day ゼロ件",
	args: {
		name: "新しいプログラム",
		meta: null,
		days: [],
	},
};

// 種目計画を全削除した後のエッジケース。設計判断 #61 により通常状態では発生しないが、
// 削除直後の transient state として ExercisePlanSection が ExercisePlanPickerCard のみ表示する空状態。
export const NoExercisePlansInSelectedDay: Story = {
	name: "選択中の Day に種目計画ゼロ件（削除直後の transient state）",
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

// 設計判断 #71 の「初期構造の生成は consumer 責務」を story 上で再現するための stateful wrapper。
// 種目選択 / 新規登録時はその exercise を含む種目計画を新規作成する（exercise: null の transient state は持たない）。
// 未登録種目は availableExercises にも追加する。削除時は対象 id を除外する。
// 追加直後の種目計画は lastAddedExercisePlanId に記録し、SetPlanFormDialog を自動オープン
// （種目選択 → 即セット定義の流れを途切れさせない）。
const StatefulProgramDetail: FC<ComponentProps<typeof ProgramDetail>> = ({
	days: initialDays,
	availableExercises: initialAvailableExercises,
	onAddExercisePlanWithSelectedExercise,
	onAddExercisePlanWithNewExercise,
	onAddSetPlan,
	onChangeSetPlan,
	onDeleteSetPlan,
	...rest
}) => {
	const [days, setDays] = useState(initialDays);
	const [availableExercises, setAvailableExercises] = useState(
		initialAvailableExercises,
	);
	const [lastAddedExercisePlanId, setLastAddedExercisePlanId] = useState<
		string | undefined
	>(undefined);

	const handleAddExercisePlanWithSelectedExercise = (
		dayId: string,
		exerciseId: string,
	) => {
		const selected = availableExercises.find((e) => e.id === exerciseId);
		if (selected === undefined) return;
		const newExercisePlanId = crypto.randomUUID();
		setDays((prev) =>
			prev.map((day) =>
				day.id === dayId
					? {
							...day,
							exercisePlans: [
								...day.exercisePlans,
								{
									id: newExercisePlanId,
									exercise: {
										id: selected.id,
										name: selected.name,
										weightUnit: "kg",
										weightStep: 2.5,
									},
									setPlans: [],
								},
							],
						}
					: day,
			),
		);
		setLastAddedExercisePlanId(newExercisePlanId);
		onAddExercisePlanWithSelectedExercise(dayId, exerciseId);
	};

	const handleAddExercisePlanWithNewExercise = (
		dayId: string,
		name: string,
	) => {
		const id = `ex-new-${Date.now()}`;
		const newExercisePlanId = crypto.randomUUID();
		setAvailableExercises((prev) => [...prev, { id, name }]);
		setDays((prev) =>
			prev.map((day) =>
				day.id === dayId
					? {
							...day,
							exercisePlans: [
								...day.exercisePlans,
								{
									id: newExercisePlanId,
									exercise: {
										id,
										name,
										weightUnit: "kg",
										weightStep: 2.5,
									},
									setPlans: [],
								},
							],
						}
					: day,
			),
		);
		setLastAddedExercisePlanId(newExercisePlanId);
		onAddExercisePlanWithNewExercise(dayId, name);
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

	const handleAddSetPlan: ComponentProps<typeof ProgramDetail>["onAddSetPlan"] =
		(exercisePlanId, payload) => {
			setDays((prev) =>
				prev.map((day) => ({
					...day,
					exercisePlans: day.exercisePlans.map((exercisePlan) =>
						exercisePlan.id === exercisePlanId
							? {
									...exercisePlan,
									setPlans: [
										...exercisePlan.setPlans,
										{ id: crypto.randomUUID(), ...payload },
									],
								}
							: exercisePlan,
					),
				})),
			);
			onAddSetPlan(exercisePlanId, payload);
		};

	const handleChangeSetPlan: ComponentProps<
		typeof ProgramDetail
	>["onChangeSetPlan"] = (setPlanId, payload) => {
		setDays((prev) =>
			prev.map((day) => ({
				...day,
				exercisePlans: day.exercisePlans.map((exercisePlan) => ({
					...exercisePlan,
					setPlans: exercisePlan.setPlans.map((setPlan) =>
						setPlan.id === setPlanId ? { id: setPlanId, ...payload } : setPlan,
					),
				})),
			})),
		);
		onChangeSetPlan(setPlanId, payload);
	};

	const handleDeleteSetPlan = (setPlanId: string) => {
		setDays((prev) =>
			prev.map((day) => ({
				...day,
				exercisePlans: day.exercisePlans.map((exercisePlan) => ({
					...exercisePlan,
					setPlans: exercisePlan.setPlans.filter(
						(setPlan) => setPlan.id !== setPlanId,
					),
				})),
			})),
		);
		onDeleteSetPlan(setPlanId);
	};

	return (
		<ProgramDetail
			{...rest}
			days={days}
			availableExercises={availableExercises}
			onAddExercisePlanWithSelectedExercise={
				handleAddExercisePlanWithSelectedExercise
			}
			onAddExercisePlanWithNewExercise={handleAddExercisePlanWithNewExercise}
			onDeleteExercisePlan={handleDeleteExercisePlan}
			onAddSetPlan={handleAddSetPlan}
			onChangeSetPlan={handleChangeSetPlan}
			onDeleteSetPlan={handleDeleteSetPlan}
			lastAddedExercisePlanId={lastAddedExercisePlanId}
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

// picker (広画面 = ComboBox) で既存の種目を選ぶと、その種目で種目計画が追加される。
// ExerciseSelector 自体の振る舞いは exercise-selector.stories.tsx で網羅しているため、
// ここでは「ExercisePlanSection の picker から選択が伝搬する」点だけ確認する。
export const AddExercisePlanBySelectingExercise: Story = {
	name: "picker から既存種目を選ぶと onAddExercisePlanWithSelectedExercise が呼ばれる",
	globals: { viewport: { value: "desktop" } },
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
		const combobox = await waitFor(() => {
			const input = canvas.getByRole("combobox", { name: "種目を追加" });
			if (!(input instanceof HTMLInputElement)) {
				throw new Error("combobox is not an input");
			}
			return input;
		});
		await userEvent.click(combobox);
		await userEvent.type(combobox, "ベンチ");

		const option = await waitFor(() => {
			const found = Array.from(
				document.querySelectorAll<HTMLElement>('[role="option"]'),
			).find((o) => o.textContent === "ベンチプレス");
			if (found === undefined) throw new Error("option not found");
			return found;
		});
		await userEvent.click(option);

		await waitFor(() => {
			expect(args.onAddExercisePlanWithSelectedExercise).toHaveBeenCalledWith(
				"d1",
				"ex-bench",
			);
		});
	},
};
