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

const SAMPLE_WORKOUTS: Day["workouts"] = [
	{
		id: "w-d1-2026-05-22",
		startedAt: new Date("2026-05-22T19:30:00"),
		exerciseNames: ["ベンチプレス", "インクラインダンベルプレス"],
		exerciseCount: 2,
		setCount: 3,
		totalVolumeKg: 2900,
	},
	{
		id: "w-d1-2026-05-15",
		startedAt: new Date("2026-05-15T19:10:00"),
		exerciseNames: ["ベンチプレス", "インクラインダンベルプレス", "ディップス"],
		exerciseCount: 3,
		setCount: 7,
		totalVolumeKg: 5120,
	},
];

const SAMPLE_DAYS: Day[] = [
	{
		id: "d1",
		label: "Day 1: 上半身プッシュ",
		detailHref: "/programs/p1/days/d1",
		workouts: SAMPLE_WORKOUTS,
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
		workouts: [
			{
				id: "w-d2-2026-05-20",
				startedAt: new Date("2026-05-20T07:20:00"),
				exerciseNames: ["バックスクワット"],
				exerciseCount: 1,
				setCount: 3,
				totalVolumeKg: 1260,
			},
		],
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
		workouts: [],
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
		onDeleteDay: fn(),
		onChangeDayLabel: fn(),
		onChangeProgramInfo: fn(),
		onDuplicate: fn(),
		onDelete: fn(),
		onStartWorkoutFromDay: fn(),
		onViewWorkoutDetail: fn(),
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
	render: (args) => <StatefulProgramDetail {...args} />,
} satisfies Meta<typeof ProgramDetail>;

export default meta;
type Story = StoryObj<typeof meta>;

const openProgramActionsMenu = async (canvasElement: HTMLElement) => {
	const canvas = within(canvasElement);
	await userEvent.click(canvas.getByRole("button", { name: "プログラム操作" }));
	return within(document.body);
};

const openProgramInfoEditor = async (canvasElement: HTMLElement) => {
	const body = await openProgramActionsMenu(canvasElement);
	await userEvent.click(
		await waitFor(() => body.getByRole("menuitem", { name: "情報を編集" })),
	);
	return body;
};

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
				workouts: [],
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
	name: initialName,
	meta: initialMeta,
	days: initialDays,
	availableExercises: initialAvailableExercises,
	onAddDay,
	onDeleteDay,
	onChangeDayLabel,
	onChangeProgramInfo,
	onDuplicate,
	onDelete,
	onStartWorkoutFromDay,
	onViewWorkoutDetail,
	onAddExercisePlanWithSelectedExercise,
	onAddExercisePlanWithNewExercise,
	onDeleteExercisePlan,
	onAddSetPlan,
	onChangeSetPlan,
	onDeleteSetPlan,
	...rest
}) => {
	const [name, setName] = useState(initialName);
	const [meta, setMeta] = useState(initialMeta);
	const [days, setDays] = useState(initialDays);
	const [availableExercises, setAvailableExercises] = useState(
		initialAvailableExercises,
	);
	const [lastAddedExercisePlanId, setLastAddedExercisePlanId] = useState<
		string | undefined
	>(undefined);
	const [lastAddedDayId, setLastAddedDayId] = useState<string | undefined>(
		undefined,
	);

	const handleAddDay = () => {
		const id = crypto.randomUUID();
		setDays((prev) => [
			...prev,
			{
				id,
				label: `Day ${prev.length + 1}`,
				detailHref: `/programs/p1/days/${id}`,
				workouts: [],
				exercisePlans: [],
			},
		]);
		setLastAddedDayId(id);
		onAddDay();
	};

	const handleDeleteDay = (dayId: string) => {
		setDays((prev) => prev.filter((day) => day.id !== dayId));
		onDeleteDay(dayId);
	};

	const handleChangeDayLabel = (dayId: string, label: string) => {
		setDays((prev) =>
			prev.map((day) => (day.id === dayId ? { ...day, label } : day)),
		);
		onChangeDayLabel(dayId, label);
	};

	const handleChangeProgramInfo: ComponentProps<
		typeof ProgramDetail
	>["onChangeProgramInfo"] = (payload) => {
		setName(payload.name);
		setMeta(payload.meta);
		onChangeProgramInfo(payload);
	};

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
		onDeleteExercisePlan(exercisePlanId);
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
			name={name}
			meta={meta}
			days={days}
			availableExercises={availableExercises}
			onAddDay={handleAddDay}
			onDeleteDay={handleDeleteDay}
			onChangeDayLabel={handleChangeDayLabel}
			onChangeProgramInfo={handleChangeProgramInfo}
			onDuplicate={onDuplicate}
			onDelete={onDelete}
			onStartWorkoutFromDay={onStartWorkoutFromDay}
			onViewWorkoutDetail={onViewWorkoutDetail}
			onAddExercisePlanWithSelectedExercise={
				handleAddExercisePlanWithSelectedExercise
			}
			onAddExercisePlanWithNewExercise={handleAddExercisePlanWithNewExercise}
			onDeleteExercisePlan={handleDeleteExercisePlan}
			onAddSetPlan={handleAddSetPlan}
			onChangeSetPlan={handleChangeSetPlan}
			onDeleteSetPlan={handleDeleteSetPlan}
			lastAddedExercisePlanId={lastAddedExercisePlanId}
			lastAddedDayId={lastAddedDayId}
		/>
	);
};

export const EditProgramInfoSavesOnConfirm: Story = {
	name: "プログラム名とメモを編集して確定で保存する",
	args: {
		name: "5/3/1 BBB",
		meta: "メインリフトは 5/3/1 で、補助は BBB。",
		days: SAMPLE_DAYS,
	},
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		const body = await openProgramInfoEditor(canvasElement);
		const nameInput = await waitFor(() =>
			body.getByRole("textbox", { name: "プログラム名" }),
		);
		const metaInput = body.getByRole("textbox", {
			name: "メモ",
		});
		await userEvent.clear(nameInput);
		await userEvent.type(nameInput, "Strength Base");
		await userEvent.clear(metaInput);
		await userEvent.type(metaInput, "週 3 回。フォーム優先。");
		await userEvent.click(body.getByRole("button", { name: "確定" }));
		await waitFor(() => {
			expect(args.onChangeProgramInfo).toHaveBeenCalledWith({
				name: "Strength Base",
				meta: "週 3 回。フォーム優先。",
			});
		});
		await waitFor(() => {
			expect(
				canvas.getByRole("heading", { name: "Strength Base" }),
			).toBeInTheDocument();
		});
	},
};

export const EditProgramInfoCancelsOnEscape: Story = {
	name: "プログラム情報編集を Escape で破棄する",
	args: {
		name: "5/3/1 BBB",
		meta: "メインリフトは 5/3/1 で、補助は BBB。",
		days: SAMPLE_DAYS,
	},
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		const body = await openProgramInfoEditor(canvasElement);
		const nameInput = await waitFor(() =>
			body.getByRole("textbox", { name: "プログラム名" }),
		);
		await userEvent.clear(nameInput);
		await userEvent.type(nameInput, "Strength Base{Escape}");
		await waitFor(() => {
			expect(args.onChangeProgramInfo).not.toHaveBeenCalled();
		});
		await waitFor(() => {
			expect(
				canvas.getByRole("heading", { name: "5/3/1 BBB" }),
			).toBeInTheDocument();
		});
	},
};

export const DuplicateProgramInvokesCallback: Story = {
	name: "プログラム操作メニューでコピーして新規作成すると onDuplicate が呼ばれる",
	args: {
		name: "5/3/1 BBB",
		meta: null,
		days: SAMPLE_DAYS,
	},
	play: async ({ canvasElement, args }) => {
		const body = await openProgramActionsMenu(canvasElement);
		await userEvent.click(
			await waitFor(() =>
				body.getByRole("menuitem", { name: "コピーして新規作成" }),
			),
		);
		await waitFor(() => {
			expect(args.onDuplicate).toHaveBeenCalled();
		});
	},
};

export const DeleteProgramInvokesCallbackAfterConfirm: Story = {
	name: "プログラム操作メニューで削除確認して onDelete が呼ばれる",
	args: {
		name: "5/3/1 BBB",
		meta: null,
		days: SAMPLE_DAYS,
	},
	play: async ({ canvasElement, args }) => {
		const body = await openProgramActionsMenu(canvasElement);
		await userEvent.click(
			await waitFor(() => body.getByRole("menuitem", { name: "削除" })),
		);
		const dialog = await waitFor(() => {
			const found = body.getByRole("alertdialog", {
				name: "このプログラムを削除しますか？",
			});
			expect(found).toBeInTheDocument();
			return found;
		});
		await userEvent.click(within(dialog).getByRole("button", { name: "削除" }));
		await waitFor(() => {
			expect(args.onDelete).toHaveBeenCalled();
		});
	},
};

export const ViewWorkoutDetailInvokesCallback: Story = {
	name: "実施履歴からワークアウト詳細を開ける",
	args: {
		name: "5/3/1 BBB",
		meta: null,
		days: SAMPLE_DAYS,
	},
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		expect(
			canvas.getByText("ベンチプレス、インクラインダンベルプレス"),
		).toBeInTheDocument();
		expect(canvas.getByText("2種目 / 3セット")).toBeInTheDocument();
		expect(canvas.getByText("総ボリューム 2,900kg")).toBeInTheDocument();
		await userEvent.click(
			canvas.getByRole("button", {
				name: "2026/05/22 19:30の実施履歴を確認、ベンチプレス、インクラインダンベルプレス、2種目 / 3セット、総ボリューム 2,900kg",
			}),
		);
		await waitFor(() => {
			expect(args.onViewWorkoutDetail).toHaveBeenCalledWith("w-d1-2026-05-22");
		});
	},
};

export const StartWorkoutFromDayInvokesCallback: Story = {
	name: "実施する導線を押すと選択中の Day id で呼ばれる",
	args: {
		name: "5/3/1 BBB",
		meta: null,
		days: SAMPLE_DAYS,
	},
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		await userEvent.click(
			canvas.getByRole("button", {
				name: "「Day 1: 上半身プッシュ」を実施する",
			}),
		);
		await waitFor(() => {
			expect(args.onStartWorkoutFromDay).toHaveBeenCalledWith("d1");
		});
	},
};

export const ExercisePlanAddDeleteFlow: Story = {
	name: "種目計画の追加・削除を実体験できる",
	args: {
		name: "新しいプログラム",
		meta: null,
		days: [
			{
				id: "d1",
				label: "Day 1",
				detailHref: "/programs/p1/days/d1",
				workouts: [],
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
				workouts: [],
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
				workouts: [],
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

// Day 1 件以上の通常状態で「+ Day」ボタンが TabList の右隣に表示され、
// 押下すると onAddDay が呼ばれ、新規 Day タブが選択状態になる。
export const AddDayFromExistingDays: Story = {
	name: "通常状態から Day を追加すると新しい Day が選択される",
	args: {
		name: "5/3/1 BBB",
		meta: null,
		days: SAMPLE_DAYS,
	},
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		await userEvent.click(canvas.getByRole("button", { name: "Day を追加" }));
		await waitFor(() => {
			expect(args.onAddDay).toHaveBeenCalled();
		});
		await waitFor(() => {
			const newTab = canvas.getByRole("tab", { name: "Day 4" });
			expect(newTab).toHaveAttribute("aria-selected", "true");
		});
		expect(
			canvas.queryByRole("textbox", { name: "Day 4のラベル" }),
		).not.toBeInTheDocument();
	},
};

export const AddDayConsecutively: Story = {
	name: "Day を連続追加すると最後に追加した Day が選択される",
	args: {
		name: "5/3/1 BBB",
		meta: null,
		days: SAMPLE_DAYS,
	},
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		await userEvent.click(canvas.getByRole("button", { name: "Day を追加" }));
		await userEvent.click(canvas.getByRole("button", { name: "Day を追加" }));
		await waitFor(() => {
			expect(args.onAddDay).toHaveBeenCalledTimes(2);
		});
		expect(args.onChangeDayLabel).not.toHaveBeenCalled();
		await waitFor(() => {
			const secondAddedTab = canvas.getByRole("tab", { name: "Day 5" });
			expect(secondAddedTab).toHaveAttribute("aria-selected", "true");
		});
	},
};

export const DeleteDayInvokesCallback: Story = {
	name: "Day 操作メニューで削除すると onDeleteDay が対象 id で呼ばれる",
	args: {
		name: "5/3/1 BBB",
		meta: null,
		days: SAMPLE_DAYS,
	},
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		await userEvent.click(
			canvas.getByRole("button", { name: "Day 1: 上半身プッシュの操作" }),
		);
		await userEvent.click(
			await waitFor(() =>
				within(document.body).getByRole("menuitem", {
					name: "Day 1: 上半身プッシュを削除",
				}),
			),
		);
		await waitFor(() => {
			expect(args.onDeleteDay).toHaveBeenCalledWith("d1");
		});
		await waitFor(() => {
			const fallbackTab = canvas.getByRole("tab", { name: "Day 2: 下半身" });
			expect(fallbackTab).toHaveAttribute("aria-selected", "true");
		});
	},
};

export const EditDayLabelSavesOnEnter: Story = {
	name: "Day ラベルを編集して Enter で保存する",
	args: {
		name: "5/3/1 BBB",
		meta: null,
		days: SAMPLE_DAYS,
	},
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		await userEvent.click(
			canvas.getByRole("button", { name: "Day 1: 上半身プッシュの操作" }),
		);
		await userEvent.click(
			await waitFor(() =>
				within(document.body).getByRole("menuitem", { name: "名前を変更" }),
			),
		);
		const input = within(document.body).getByRole("textbox", {
			name: "Day 1: 上半身プッシュのラベル",
		});
		await userEvent.clear(input);
		await userEvent.type(input, "Push Day{Enter}");
		await waitFor(() => {
			expect(args.onChangeDayLabel).toHaveBeenCalledWith("d1", "Push Day");
		});
		await waitFor(() => {
			expect(canvas.getByRole("tab", { name: "Push Day" })).toHaveAttribute(
				"aria-selected",
				"true",
			);
		});
	},
};

export const EditDayLabelSavesOnConfirm: Story = {
	name: "Day ラベルを編集して確定で保存する",
	args: {
		name: "5/3/1 BBB",
		meta: null,
		days: SAMPLE_DAYS,
	},
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		await userEvent.click(
			canvas.getByRole("button", { name: "Day 1: 上半身プッシュの操作" }),
		);
		await userEvent.click(
			await waitFor(() =>
				within(document.body).getByRole("menuitem", { name: "名前を変更" }),
			),
		);
		const input = within(document.body).getByRole("textbox", {
			name: "Day 1: 上半身プッシュのラベル",
		});
		await userEvent.clear(input);
		await userEvent.type(input, "Push Day");
		await userEvent.click(
			within(document.body).getByRole("button", { name: "確定" }),
		);
		await waitFor(() => {
			expect(args.onChangeDayLabel).toHaveBeenCalledWith("d1", "Push Day");
		});
		await waitFor(() => {
			expect(canvas.getByRole("tab", { name: "Push Day" })).toHaveAttribute(
				"aria-selected",
				"true",
			);
		});
	},
};

export const EditDayLabelCancelsOnEscape: Story = {
	name: "Day ラベル編集を Escape で破棄する",
	args: {
		name: "5/3/1 BBB",
		meta: null,
		days: SAMPLE_DAYS,
	},
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		await userEvent.click(
			canvas.getByRole("button", { name: "Day 1: 上半身プッシュの操作" }),
		);
		await userEvent.click(
			await waitFor(() =>
				within(document.body).getByRole("menuitem", { name: "名前を変更" }),
			),
		);
		const input = within(document.body).getByRole("textbox", {
			name: "Day 1: 上半身プッシュのラベル",
		});
		await userEvent.clear(input);
		await userEvent.type(input, "Push Day{Escape}");
		await waitFor(() => {
			expect(args.onChangeDayLabel).not.toHaveBeenCalled();
		});
		await waitFor(() => {
			expect(
				canvas.getByRole("tab", { name: "Day 1: 上半身プッシュ" }),
			).toHaveAttribute("aria-selected", "true");
		});
	},
};
