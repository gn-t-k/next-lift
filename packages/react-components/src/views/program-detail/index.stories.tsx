import type { Meta, StoryObj } from "@storybook/react";
import type { ComponentProps, FC, ReactNode } from "react";
import { Suspense, use, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { Main } from "../../primitives/main";
import { ExercisePlanSection } from "../exercise-plan-section";
import { SetPlanSection } from "../set-plan-section";
import type { SetPlan, SetPlanDraft } from "../set-plan-section/set-plan-types";
import type { WeightUnit } from "../weight-unit";
import {
	type WorkoutHistory,
	WorkoutHistorySection,
} from "../workout-history-section";
import { ProgramDetail, ProgramDetailError, ProgramDetailLoading } from ".";

type ProgramDetailProps = ComponentProps<typeof ProgramDetail>;
type Program = ProgramDetailProps["program"];
type ShellDay = ProgramDetailProps["days"][number];
type Selection = NonNullable<ProgramDetailProps["selection"]>;
type AvailableExercise = {
	id: string;
	name: string;
};
type Exercise = {
	id: string;
	name: string;
	weightUnit: WeightUnit;
	weightStep: number;
	detailHref: string;
};
type ExercisePlan = {
	id: string;
	exercise: Exercise;
	setPlans: SetPlan[];
};
type Day = ShellDay & {
	startWorkoutHref: string;
	workouts: WorkoutHistory[];
	exercisePlans: ExercisePlan[];
};
type ProgramDetailData = {
	program: Program;
	days: Day[];
	availableExercises: AvailableExercise[];
	selection: Selection;
};
type ExercisePlanActions = {
	onAddWithSelectedExercise: (dayId: string, exerciseId: string) => void;
	onAddWithNewExercise: (dayId: string, name: string) => void;
	onDelete: (exercisePlanId: string) => void;
};
type SetPlanActions = {
	onAdd: (exercisePlanId: string, payload: SetPlanDraft) => void;
	onChange: (setPlanId: string, payload: SetPlanDraft) => void;
	onDelete: (setPlanId: string) => void;
};
type Outcome = "success" | "error";
type ProgramDetailStoryProps = ProgramDetailData & {
	programActions: ProgramDetailProps["programActions"];
	dayActions: ProgramDetailProps["dayActions"];
	exercisePlanActions: ExercisePlanActions;
	setPlanActions: SetPlanActions;
	renderExerciseProgress: (exerciseId: string) => ReactNode;
	delayMs: number;
	outcome: Outcome;
};
type SuspendedProgramDetailProps = Omit<
	ProgramDetailStoryProps,
	keyof ProgramDetailData | "delayMs" | "outcome"
> & {
	promise: Promise<ProgramDetailData>;
};
type StatefulProgramDetailProps = Omit<
	SuspendedProgramDetailProps,
	"promise"
> & {
	program: Program;
	days: Day[];
	availableExercises: AvailableExercise[];
	selection: Selection;
};

const renderDummyExerciseProgress = (id: string): ReactNode => (
	<div>種目 {id} の推移（ダミー）</div>
);

const benchPress: Exercise = {
	id: "ex-bench",
	name: "ベンチプレス",
	weightUnit: "kg",
	weightStep: 2.5,
	detailHref: "/exercises/ex-bench",
};

const inclineDumbbell: Exercise = {
	id: "ex-incline-db",
	name: "インクラインダンベルプレス",
	weightUnit: "kg",
	weightStep: 1,
	detailHref: "/exercises/ex-incline-db",
};

const squat: Exercise = {
	id: "ex-squat",
	name: "バックスクワット",
	weightUnit: "kg",
	weightStep: 2.5,
	detailHref: "/exercises/ex-squat",
};

const SAMPLE_PROGRAM: Program = {
	name: "5/3/1 BBB",
	meta: "メインリフトは 5/3/1 で、補助は BBB（Boring But Big）。\nDeload week は 4 週ごとに挿入する。",
};

const SAMPLE_AVAILABLE_EXERCISES: AvailableExercise[] = [
	{ id: "ex-bench", name: "ベンチプレス" },
	{ id: "ex-incline-db", name: "インクラインダンベルプレス" },
	{ id: "ex-squat", name: "バックスクワット" },
	{ id: "ex-deadlift", name: "デッドリフト" },
	{ id: "ex-overhead-press", name: "オーバーヘッドプレス" },
];

const SAMPLE_WORKOUTS: WorkoutHistory[] = [
	{
		id: "w-d1-2026-05-22",
		startedAt: new Date("2026-05-22T19:30:00"),
		detailHref: "/workouts/w-d1-2026-05-22",
		memoPreview: "右肩に違和感あり。次回はアップを長めにする。",
	},
	{
		id: "w-d1-2026-05-15",
		startedAt: new Date("2026-05-15T19:10:00"),
		detailHref: "/workouts/w-d1-2026-05-15",
		memoPreview: null,
	},
];

const SAMPLE_DAYS: Day[] = [
	{
		id: "d1",
		label: "Day 1: 上半身プッシュ",
		startWorkoutHref: "/workouts/new?dayId=d1",
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
		startWorkoutHref: "/workouts/new?dayId=d2",
		workouts: [
			{
				id: "w-d2-2026-05-20",
				startedAt: new Date("2026-05-20T07:20:00"),
				detailHref: "/workouts/w-d2-2026-05-20",
				memoPreview: "フォームは安定。最終セットだけ少し重い。",
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
		startWorkoutHref: "/workouts/new?dayId=d3",
		workouts: [],
		exercisePlans: [],
	},
];

const DEFAULT_SELECTION: Selection = {
	defaultSelectedDayId: "d1",
};

const ProgramDetailStory: FC<ProgramDetailStoryProps> = ({
	program,
	days,
	availableExercises,
	selection,
	programActions,
	dayActions,
	exercisePlanActions,
	setPlanActions,
	renderExerciseProgress,
	delayMs,
	outcome,
}) => {
	const promise = createProgramDetailPromise({
		data: {
			program,
			days,
			availableExercises,
			selection,
		},
		delayMs,
		outcome,
	});

	return (
		<ErrorBoundary
			fallback={
				<ProgramDetailError message="ネットワーク接続を確認して再試行してください。" />
			}
			resetKeys={[promise]}
		>
			<Suspense fallback={<ProgramDetailLoading />}>
				<SuspendedProgramDetail
					promise={promise}
					programActions={programActions}
					dayActions={dayActions}
					exercisePlanActions={exercisePlanActions}
					setPlanActions={setPlanActions}
					renderExerciseProgress={renderExerciseProgress}
				/>
			</Suspense>
		</ErrorBoundary>
	);
};

const meta = {
	title: "View/V2 プログラム詳細",
	component: ProgramDetailStory,
	parameters: {
		layout: "fullscreen",
	},
	tags: ["autodocs"],
	args: {
		program: SAMPLE_PROGRAM,
		days: SAMPLE_DAYS,
		availableExercises: SAMPLE_AVAILABLE_EXERCISES,
		selection: DEFAULT_SELECTION,
		programActions: {
			onChange: fn(),
			onDuplicate: fn(),
			onDelete: fn(),
		},
		dayActions: {
			onAdd: fn(),
			onDelete: fn(),
			onChangeLabel: fn(),
		},
		exercisePlanActions: {
			onAddWithSelectedExercise: fn(),
			onAddWithNewExercise: fn(),
			onDelete: fn(),
		},
		setPlanActions: {
			onAdd: fn(),
			onChange: fn(),
			onDelete: fn(),
		},
		renderExerciseProgress: renderDummyExerciseProgress,
		delayMs: 0,
		outcome: "success",
	},
	decorators: [
		(Story) => (
			<Main width="wide">
				<Story />
			</Main>
		),
	],
	render: (args) => <ProgramDetailStory {...args} />,
} satisfies Meta<typeof ProgramDetailStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MultipleDays: Story = {
	name: "複数 Day",
	args: {
		program: SAMPLE_PROGRAM,
		days: SAMPLE_DAYS,
	},
};

export const NoMeta: Story = {
	name: "meta なし",
	args: {
		program: {
			name: "PPL Hypertrophy",
			meta: null,
		},
		days: SAMPLE_DAYS,
	},
};

export const LongProgramName: Story = {
	name: "長いプログラム名",
	args: {
		program: {
			name: "Wendler 5/3/1 Boring But Big with Joker Sets and First Set Last AMRAP Conjugate Method (3-day split, 16-week mesocycle, deload weeks included) 詳細メソッド付きの上級者向け長期プログラム（完全版）",
			meta: SAMPLE_PROGRAM.meta,
		},
		days: SAMPLE_DAYS,
	},
};

export const Loading: Story = {
	name: "ローディング状態",
	render: () => <ProgramDetailLoading />,
};

export const LoadingMobile: Story = {
	name: "ローディング状態（モバイル）",
	globals: {
		viewport: { value: "mobile" },
	},
	render: () => <ProgramDetailLoading />,
};

export const LoadingDesktop: Story = {
	name: "ローディング状態（デスクトップ）",
	globals: {
		viewport: { value: "desktop" },
	},
	render: () => <ProgramDetailLoading />,
};

export const ErrorDefault: Story = {
	name: "エラー状態",
	render: () => <ProgramDetailError />,
};

export const ErrorWithMessage: Story = {
	name: "エラー状態（メッセージあり）",
	render: () => (
		<ProgramDetailError message="ネットワーク接続を確認して再試行してください。" />
	),
};

export const ErrorMobile: Story = {
	name: "エラー状態（モバイル）",
	globals: {
		viewport: { value: "mobile" },
	},
	render: () => (
		<ProgramDetailError message="ネットワーク接続を確認して再試行してください。" />
	),
};

export const ErrorDesktop: Story = {
	name: "エラー状態（デスクトップ）",
	globals: {
		viewport: { value: "desktop" },
	},
	render: () => (
		<ProgramDetailError message="ネットワーク接続を確認して再試行してください。" />
	),
};

export const FlowLoadingToDetail: Story = {
	name: "フロー: ローディング → 詳細",
	args: {
		delayMs: 1500,
		outcome: "success",
	},
};

export const FlowLoadingToError: Story = {
	name: "フロー: ローディング → エラー",
	args: {
		delayMs: 1500,
		outcome: "error",
	},
};

export const NoDays: Story = {
	name: "Day ゼロ件",
	args: {
		program: {
			name: "新しいプログラム",
			meta: null,
		},
		days: [],
		selection: {},
	},
};

export const NoExercisePlansInSelectedDay: Story = {
	name: "選択中の Day に種目計画ゼロ件（削除直後の transient state）",
	args: {
		program: {
			name: "新しいプログラム",
			meta: null,
		},
		days: [
			{
				id: "d1",
				label: "Day 1",
				startWorkoutHref: "/workouts/new?dayId=d1",
				workouts: [],
				exercisePlans: [],
			},
		],
	},
};

export const EditProgramInfoSavesOnConfirm: Story = {
	name: "プログラム名とメモを編集して確定で保存する",
	args: {
		program: {
			name: "5/3/1 BBB",
			meta: "メインリフトは 5/3/1 で、補助は BBB。",
		},
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
			expect(args.programActions.onChange).toHaveBeenCalledWith({
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
		program: {
			name: "5/3/1 BBB",
			meta: "メインリフトは 5/3/1 で、補助は BBB。",
		},
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
			expect(args.programActions.onChange).not.toHaveBeenCalled();
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
		program: {
			name: "5/3/1 BBB",
			meta: null,
		},
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
			expect(args.programActions.onDuplicate).toHaveBeenCalled();
		});
	},
};

export const DeleteProgramInvokesCallbackAfterConfirm: Story = {
	name: "プログラム操作メニューで削除確認して onDelete が呼ばれる",
	args: {
		program: {
			name: "5/3/1 BBB",
			meta: null,
		},
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
			expect(args.programActions.onDelete).toHaveBeenCalled();
		});
	},
};

export const WorkoutHistoryLinksToDetail: Story = {
	name: "実施履歴がワークアウト詳細へのリンクになる",
	args: {
		program: {
			name: "5/3/1 BBB",
			meta: null,
		},
		days: SAMPLE_DAYS,
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		expect(
			await canvas.findByText("右肩に違和感あり。次回はアップを長めにする。"),
		).toBeInTheDocument();
		const link = canvas.getByRole("link", {
			name: "2026/05/22 19:30の実施履歴を確認、メモ: 右肩に違和感あり。次回はアップを長めにする。",
		});
		expect(link).toHaveAttribute("href", "/workouts/w-d1-2026-05-22");
	},
};

export const StartWorkoutLinksToNewWorkout: Story = {
	name: "実施する導線が新規ワークアウトへのリンクになる",
	args: {
		program: {
			name: "5/3/1 BBB",
			meta: null,
		},
		days: SAMPLE_DAYS,
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const link = await canvas.findByRole("link", {
			name: "「Day 1: 上半身プッシュ」を実施する",
		});
		expect(link).toHaveAttribute("href", "/workouts/new?dayId=d1");
	},
};

export const ExerciseNameLinksToDetail: Story = {
	name: "種目名が種目詳細（V13）へのリンクになる",
	args: {
		program: {
			name: "5/3/1 BBB",
			meta: null,
		},
		days: SAMPLE_DAYS,
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const link = await canvas.findByRole("link", { name: "ベンチプレス" });
		expect(link).toHaveAttribute("href", "/exercises/ex-bench");
	},
};

export const ExerciseProgressToggleOpensProgressView: Story = {
	name: "種目推移トグルを押すと推移表示が開く",
	globals: { viewport: { value: "desktop" } },
	args: {
		program: {
			name: "5/3/1 BBB",
			meta: null,
		},
		days: SAMPLE_DAYS,
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await userEvent.click(
			await canvas.findByRole("button", { name: "ベンチプレスの推移を見る" }),
		);
		const body = within(document.body);
		await waitFor(() => {
			expect(
				body.getByRole("dialog", { name: "ベンチプレスの推移" }),
			).toBeInTheDocument();
		});
		expect(
			body.getByText("種目 ex-bench の推移（ダミー）"),
		).toBeInTheDocument();
	},
};

export const ExercisePlanAddDeleteFlow: Story = {
	name: "種目計画の追加・削除を実体験できる",
	args: {
		program: {
			name: "新しいプログラム",
			meta: null,
		},
		days: [
			{
				id: "d1",
				label: "Day 1",
				startWorkoutHref: "/workouts/new?dayId=d1",
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
		program: {
			name: "5/3/1 BBB",
			meta: null,
		},
		days: [
			{
				id: "d1",
				label: "Day 1",
				startWorkoutHref: "/workouts/new?dayId=d1",
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
			await canvas.findByRole("button", { name: "ベンチプレスを削除" }),
		);
		await waitFor(() => {
			expect(args.exercisePlanActions.onDelete).toHaveBeenCalledWith(
				"ep-d1-bench",
			);
		});
	},
};

export const AddExercisePlanBySelectingExercise: Story = {
	name: "picker から既存種目を選ぶと onAddExercisePlanWithSelectedExercise が呼ばれる",
	globals: { viewport: { value: "desktop" } },
	args: {
		program: {
			name: "新しいプログラム",
			meta: null,
		},
		days: [
			{
				id: "d1",
				label: "Day 1",
				startWorkoutHref: "/workouts/new?dayId=d1",
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
			).find((node) => node.textContent === "ベンチプレス");
			if (found === undefined) throw new Error("option not found");
			return found;
		});
		await userEvent.click(option);

		await waitFor(() => {
			expect(
				args.exercisePlanActions.onAddWithSelectedExercise,
			).toHaveBeenCalledWith("d1", "ex-bench");
		});
	},
};

export const AddDayFromExistingDays: Story = {
	name: "通常状態から Day を追加すると新しい Day が選択される",
	args: {
		program: {
			name: "5/3/1 BBB",
			meta: null,
		},
		days: SAMPLE_DAYS,
	},
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		await userEvent.click(canvas.getByRole("button", { name: "Day を追加" }));
		await waitFor(() => {
			expect(args.dayActions.onAdd).toHaveBeenCalled();
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
		program: {
			name: "5/3/1 BBB",
			meta: null,
		},
		days: SAMPLE_DAYS,
	},
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		await userEvent.click(canvas.getByRole("button", { name: "Day を追加" }));
		await userEvent.click(canvas.getByRole("button", { name: "Day を追加" }));
		await waitFor(() => {
			expect(args.dayActions.onAdd).toHaveBeenCalledTimes(2);
		});
		expect(args.dayActions.onChangeLabel).not.toHaveBeenCalled();
		await waitFor(() => {
			const secondAddedTab = canvas.getByRole("tab", { name: "Day 5" });
			expect(secondAddedTab).toHaveAttribute("aria-selected", "true");
		});
	},
};

export const DeleteDayInvokesCallback: Story = {
	name: "Day 操作メニューで削除すると onDeleteDay が対象 id で呼ばれる",
	args: {
		program: {
			name: "5/3/1 BBB",
			meta: null,
		},
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
			expect(args.dayActions.onDelete).toHaveBeenCalledWith("d1");
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
		program: {
			name: "5/3/1 BBB",
			meta: null,
		},
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
			expect(args.dayActions.onChangeLabel).toHaveBeenCalledWith(
				"d1",
				"Push Day",
			);
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
		program: {
			name: "5/3/1 BBB",
			meta: null,
		},
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
			expect(args.dayActions.onChangeLabel).toHaveBeenCalledWith(
				"d1",
				"Push Day",
			);
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
		program: {
			name: "5/3/1 BBB",
			meta: null,
		},
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
			expect(args.dayActions.onChangeLabel).not.toHaveBeenCalled();
		});
		await waitFor(() => {
			expect(
				canvas.getByRole("tab", { name: "Day 1: 上半身プッシュ" }),
			).toHaveAttribute("aria-selected", "true");
		});
	},
};

export const QuickAddSetPlanInvokesCallback: Story = {
	name: "直前セットの内容でセット計画を追加する",
	args: {
		program: {
			name: "5/3/1 BBB",
			meta: null,
		},
		days: SAMPLE_DAYS,
	},
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		await userEvent.click(await canvas.findByText("100kg × 5回を追加"));
		await waitFor(() => {
			expect(args.setPlanActions.onAdd).toHaveBeenCalledWith("ep-d1-bench", {
				pattern: "weight-reps",
				weight: 100,
				reps: 5,
			});
		});
	},
};

export const DeleteSetPlanInvokesCallback: Story = {
	name: "セット計画の削除ボタンで onDeleteSetPlan が呼ばれる",
	args: {
		program: {
			name: "5/3/1 BBB",
			meta: null,
		},
		days: SAMPLE_DAYS,
	},
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		await userEvent.click(
			await canvas.findByRole("button", {
				name: "ベンチプレス 1セット目を削除",
			}),
		);
		await waitFor(() => {
			expect(args.setPlanActions.onDelete).toHaveBeenCalledWith(
				"sp-d1-bench-1",
			);
		});
	},
};

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

const SuspendedProgramDetail: FC<SuspendedProgramDetailProps> = ({
	promise,
	programActions,
	dayActions,
	exercisePlanActions,
	setPlanActions,
	renderExerciseProgress,
}) => {
	const data = use(promise);
	return (
		<StatefulProgramDetail
			program={data.program}
			days={data.days}
			availableExercises={data.availableExercises}
			selection={data.selection}
			programActions={programActions}
			dayActions={dayActions}
			exercisePlanActions={exercisePlanActions}
			setPlanActions={setPlanActions}
			renderExerciseProgress={renderExerciseProgress}
		/>
	);
};

const StatefulProgramDetail: FC<StatefulProgramDetailProps> = (props) => (
	<StatefulProgramDetailImpl {...props} />
);

const StatefulProgramDetailImpl: FC<StatefulProgramDetailProps> = ({
	program: initialProgram,
	days: initialDays,
	availableExercises: initialAvailableExercises,
	selection,
	programActions,
	dayActions,
	exercisePlanActions,
	setPlanActions,
	renderExerciseProgress,
}) => {
	const [program, setProgram] = useState(initialProgram);
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

	const handleChangeProgramInfo = (payload: Program) => {
		setProgram(payload);
		programActions.onChange(payload);
	};

	const handleAddDay = () => {
		const id = crypto.randomUUID();
		const nextDay: Day = {
			id,
			label: `Day ${days.length + 1}`,
			startWorkoutHref: `/workouts/new?dayId=${id}`,
			workouts: [],
			exercisePlans: [],
		};
		setDays((prev) => [...prev, nextDay]);
		setLastAddedDayId(id);
		dayActions.onAdd();
	};

	const handleDeleteDay = (dayId: string) => {
		setDays((prev) => prev.filter((day) => day.id !== dayId));
		dayActions.onDelete(dayId);
	};

	const handleChangeDayLabel = (dayId: string, label: string) => {
		setDays((prev) =>
			prev.map((day) => (day.id === dayId ? { ...day, label } : day)),
		);
		dayActions.onChangeLabel(dayId, label);
	};

	const handleAddExercisePlanWithSelectedExercise = (
		dayId: string,
		exerciseId: string,
	) => {
		const selected = availableExercises.find(
			(exercise) => exercise.id === exerciseId,
		);
		if (selected === undefined) return;
		const newExercisePlanId = crypto.randomUUID();
		const newExercisePlan = createExercisePlan({
			id: newExercisePlanId,
			exercise: selected,
		});
		setDays((prev) =>
			prev.map((day) =>
				day.id === dayId
					? {
							...day,
							exercisePlans: [...day.exercisePlans, newExercisePlan],
						}
					: day,
			),
		);
		setLastAddedExercisePlanId(newExercisePlanId);
		exercisePlanActions.onAddWithSelectedExercise(dayId, exerciseId);
	};

	const handleAddExercisePlanWithNewExercise = (
		dayId: string,
		name: string,
	) => {
		const id = `ex-new-${Date.now()}`;
		const newExercise = { id, name };
		const newExercisePlanId = crypto.randomUUID();
		const newExercisePlan = createExercisePlan({
			id: newExercisePlanId,
			exercise: newExercise,
		});
		setAvailableExercises((prev) => [...prev, newExercise]);
		setDays((prev) =>
			prev.map((day) =>
				day.id === dayId
					? {
							...day,
							exercisePlans: [...day.exercisePlans, newExercisePlan],
						}
					: day,
			),
		);
		setLastAddedExercisePlanId(newExercisePlanId);
		exercisePlanActions.onAddWithNewExercise(dayId, name);
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
		exercisePlanActions.onDelete(exercisePlanId);
	};

	const handleAddSetPlan = (exercisePlanId: string, payload: SetPlanDraft) => {
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
		setPlanActions.onAdd(exercisePlanId, payload);
	};

	const handleChangeSetPlan = (setPlanId: string, payload: SetPlanDraft) => {
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
		setPlanActions.onChange(setPlanId, payload);
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
		setPlanActions.onDelete(setPlanId);
	};

	const nextSelection = buildSelection({
		defaultSelectedDayId: selection.defaultSelectedDayId,
		lastAddedDayId,
	});

	return (
		<ProgramDetail
			program={program}
			programActions={{
				onChange: handleChangeProgramInfo,
				onDuplicate: programActions.onDuplicate,
				onDelete: programActions.onDelete,
			}}
			days={days.map(toShellDay)}
			dayActions={{
				onAdd: handleAddDay,
				onDelete: handleDeleteDay,
				onChangeLabel: handleChangeDayLabel,
			}}
			selection={nextSelection}
		>
			{(day) => {
				const selectedDay = days.find((candidate) => candidate.id === day.id);
				return selectedDay === undefined ? (
					<ProgramDetailError message="選択中の Day を取得できませんでした。" />
				) : (
					<DayContent
						day={selectedDay}
						availableExercises={availableExercises}
						onAddExercisePlanWithSelectedExercise={
							handleAddExercisePlanWithSelectedExercise
						}
						onAddExercisePlanWithNewExercise={
							handleAddExercisePlanWithNewExercise
						}
						onDeleteExercisePlan={handleDeleteExercisePlan}
						onAddSetPlan={handleAddSetPlan}
						onChangeSetPlan={handleChangeSetPlan}
						onDeleteSetPlan={handleDeleteSetPlan}
						lastAddedExercisePlanId={lastAddedExercisePlanId}
						renderExerciseProgress={renderExerciseProgress}
					/>
				);
			}}
		</ProgramDetail>
	);
};

type DayContentProps = {
	day: Day;
	availableExercises: AvailableExercise[];
	onAddExercisePlanWithSelectedExercise: (
		dayId: string,
		exerciseId: string,
	) => void;
	onAddExercisePlanWithNewExercise: (dayId: string, name: string) => void;
	onDeleteExercisePlan: (exercisePlanId: string) => void;
	onAddSetPlan: (exercisePlanId: string, payload: SetPlanDraft) => void;
	onChangeSetPlan: (setPlanId: string, payload: SetPlanDraft) => void;
	onDeleteSetPlan: (setPlanId: string) => void;
	lastAddedExercisePlanId: string | undefined;
	renderExerciseProgress: (exerciseId: string) => ReactNode;
};

const DayContent: FC<DayContentProps> = ({
	day,
	availableExercises,
	onAddExercisePlanWithSelectedExercise,
	onAddExercisePlanWithNewExercise,
	onDeleteExercisePlan,
	onAddSetPlan,
	onChangeSetPlan,
	onDeleteSetPlan,
	lastAddedExercisePlanId,
	renderExerciseProgress,
}) => {
	return (
		<>
			<ExercisePlanSection
				exercisePlans={day.exercisePlans}
				availableExercises={availableExercises}
				onAddExercisePlanWithSelectedExercise={(exerciseId) =>
					onAddExercisePlanWithSelectedExercise(day.id, exerciseId)
				}
				onAddExercisePlanWithNewExercise={(exerciseName) =>
					onAddExercisePlanWithNewExercise(day.id, exerciseName)
				}
				onDeleteExercisePlan={onDeleteExercisePlan}
				renderExerciseProgress={renderExerciseProgress}
			>
				{(exercisePlan) => (
					<SetPlanSection
						setPlans={exercisePlan.setPlans}
						weightUnit={exercisePlan.exercise.weightUnit}
						weightStep={exercisePlan.exercise.weightStep}
						exerciseName={exercisePlan.exercise.name}
						onChangeSetPlan={onChangeSetPlan}
						onAddSetPlan={(payload) => onAddSetPlan(exercisePlan.id, payload)}
						onDeleteSetPlan={onDeleteSetPlan}
						autoFocusAddTrigger={exercisePlan.id === lastAddedExercisePlanId}
					/>
				)}
			</ExercisePlanSection>
			<WorkoutHistorySection
				dayLabel={day.label}
				startWorkoutHref={day.startWorkoutHref}
				workouts={day.workouts}
			/>
		</>
	);
};

const createProgramDetailPromise = ({
	data,
	delayMs,
	outcome,
}: {
	data: ProgramDetailData;
	delayMs: number;
	outcome: Outcome;
}): Promise<ProgramDetailData> => {
	if (delayMs === 0) {
		return outcome === "success"
			? Promise.resolve(data)
			: Promise.reject(new Error("プログラム詳細の取得に失敗しました"));
	}

	return outcome === "success"
		? fakeFetchProgramDetailSuccess(data, delayMs)
		: fakeFetchProgramDetailFailure(delayMs);
};

const createExercisePlan = ({
	id,
	exercise,
}: {
	id: string;
	exercise: AvailableExercise;
}): ExercisePlan => ({
	id,
	exercise: {
		id: exercise.id,
		name: exercise.name,
		weightUnit: "kg",
		weightStep: 2.5,
		detailHref: `/exercises/${exercise.id}`,
	},
	setPlans: [],
});

const fakeFetchProgramDetailSuccess = (
	data: ProgramDetailData,
	delayMs: number,
): Promise<ProgramDetailData> =>
	new Promise((resolve) => {
		setTimeout(() => resolve(data), delayMs);
	});

const fakeFetchProgramDetailFailure = (
	delayMs: number,
): Promise<ProgramDetailData> =>
	new Promise((_, reject) => {
		setTimeout(
			() => reject(new Error("プログラム詳細の取得に失敗しました")),
			delayMs,
		);
	});

const buildSelection = ({
	defaultSelectedDayId,
	lastAddedDayId,
}: {
	defaultSelectedDayId: string | undefined;
	lastAddedDayId: string | undefined;
}): Selection => {
	const selection: Selection = {};
	if (defaultSelectedDayId !== undefined) {
		selection.defaultSelectedDayId = defaultSelectedDayId;
	}
	if (lastAddedDayId !== undefined) {
		selection.lastAddedDayId = lastAddedDayId;
	}
	return selection;
};

const toShellDay = (day: Day): ShellDay => ({
	id: day.id,
	label: day.label,
});
