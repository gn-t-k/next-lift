import type { Meta, StoryObj } from "@storybook/react";
import {
	type ComponentProps,
	type FC,
	Suspense,
	use,
	useMemo,
	useState,
} from "react";
import { ErrorBoundary } from "react-error-boundary";
import { expect, fn, screen, userEvent, waitFor, within } from "storybook/test";
import { Heading, Section } from "../../primitives/heading";
import { Link } from "../../primitives/link";
import { Main } from "../../primitives/main";
import {
	ProgramDetailNew,
	ProgramDetailNewError,
	ProgramDetailNewLoading,
} from ".";

type ProgramDetailNewStoryProps = ComponentProps<typeof ProgramDetailNew>;
type Day = ProgramDetailNewStoryProps["days"][number];
type ExercisePlan = Day["exercisePlans"][number];
type Exercise = ExercisePlan["exercise"];
type AvailableExercise =
	ProgramDetailNewStoryProps["availableExercises"][number];
type RenderExerciseProgress =
	ProgramDetailNewStoryProps["renderExerciseProgress"];
type RenderWorkoutHistory = ProgramDetailNewStoryProps["renderWorkoutHistory"];

const renderDummyWorkoutHistory: RenderWorkoutHistory = (day) => (
	<DummyWorkoutHistory dayLabel={day.label} />
);

const renderDummyExerciseProgress: RenderExerciseProgress = (exercisePlan) => (
	<DummyExerciseProgress
		exerciseName={exercisePlan.exercise.name}
		detailHref={exercisePlan.exercise.detailHref}
	/>
);

const DummyWorkoutHistory: FC<{ dayLabel: string }> = ({ dayLabel }) => (
	<Section className="flex flex-col gap-2 rounded-lg bg-secondary/60 p-3">
		<Heading className="font-medium text-sm">実施履歴</Heading>
		<div className="grid grid-cols-1 gap-2">
			<Link
				href={`/workouts/new?day=${encodeURIComponent(dayLabel)}`}
				className="flex min-h-14 flex-col items-center justify-center gap-2 rounded-lg border border-border bg-bg p-3 text-center text-fg text-xs outline-none hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
			>
				「{dayLabel}」を実施する
			</Link>
			<Link
				href="/workouts/dummy"
				className="block min-h-14 rounded-lg border border-border bg-bg p-3 text-left outline-none hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
			>
				<span className="block font-medium text-sm">2026/05/22 19:30</span>
				<span className="mt-2 line-clamp-2 block text-muted-fg text-xs">
					メモ: 右肩に違和感あり。次回はアップを長めにする。
				</span>
			</Link>
		</div>
	</Section>
);

const DummyExerciseProgress: FC<{
	exerciseName: string;
	detailHref: string;
}> = ({ exerciseName, detailHref }) => (
	<Section className="flex flex-col gap-2 rounded-lg bg-secondary/60 p-3">
		<div className="flex items-center justify-between gap-3">
			<Heading className="min-w-0 truncate font-medium text-sm">
				種目推移
			</Heading>
			<Link
				href={detailHref}
				className="inline-flex shrink-0 rounded-md px-2 py-1 text-fg text-xs outline-none hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
			>
				詳細
			</Link>
		</div>
		<div className="rounded-md bg-bg p-3 text-muted-fg text-sm">
			{exerciseName} の推移（ダミー）
		</div>
	</Section>
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

const overheadPress: Exercise = {
	id: "ex-overhead-press",
	name: "オーバーヘッドプレス",
	weightUnit: "kg",
	weightStep: 1,
	detailHref: "/exercises/ex-overhead-press",
};

const longNameExercise: Exercise = {
	id: "ex-long-name",
	name: "テンポ指定つきポーズベンチプレス（ナローグリップ・足上げ）",
	weightUnit: "kg",
	weightStep: 1.25,
	detailHref: "/exercises/ex-long-name",
};

const AVAILABLE_EXERCISES: AvailableExercise[] = [
	{ id: benchPress.id, name: benchPress.name },
	{ id: inclineDumbbell.id, name: inclineDumbbell.name },
	{ id: squat.id, name: squat.name },
	{ id: overheadPress.id, name: overheadPress.name },
];

const FULL_DAYS: Day[] = [
	{
		id: "d1",
		label: "Day 1: 上半身プッシュ",
		memo: "押す種目をまとめる日。肩の違和感がある日は補助種目を控えめにする。",
		exercisePlans: [
			{
				id: "ep-d1-bench",
				memo: "メインセット後もフォームを崩さない。",
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
						pattern: "weight-rpe",
						weight: 95,
						rpe: 8,
					},
					{
						id: "sp-d1-bench-3",
						pattern: "reps-rpe",
						reps: 12,
						rpe: 7,
					},
				],
			},
			{
				id: "ep-d1-incline",
				memo: null,
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
		memo: "スクワットを優先する。",
		exercisePlans: [
			{
				id: "ep-d2-squat",
				memo: "腰の張りがある日は重量を控えめにする。",
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
		memo: null,
		exercisePlans: [],
	},
];

const DAY_WITHOUT_EXERCISE_PLANS: Day[] = [
	{
		id: "d-empty",
		label: "Day 1: まだ種目計画がない日",
		memo: "この状態では種目計画の追加と、セット計画側の親未選択表示を確認する。",
		exercisePlans: [],
	},
];

const EXERCISE_WITHOUT_SET_PLANS: Day[] = [
	{
		id: "d-no-sets",
		label: "Day 1: セット未設定",
		memo: "種目計画はあるが、セット計画はまだない。",
		exercisePlans: [
			{
				id: "ep-no-sets",
				memo: "セット計画追加の初期状態を確認する。",
				exercise: overheadPress,
				setPlans: [],
			},
		],
	},
];

const CREATE_EXERCISE_DAYS: Day[] = [
	{
		id: "d-create",
		label: "Day 1: 種目を登録しながら作る",
		memo: "候補がない状態から種目計画を追加する。",
		exercisePlans: [],
	},
];

const LONG_CONTENT_DAYS: Day[] = [
	{
		id: "d-long-1",
		label:
			"Day 1: とても長い名前の上半身プッシュと補助種目をまとめて確認する日",
		memo: "このメモは長文の折り返しを確認するためのものです。画面幅が狭いときにもヘッダー、パンくず、ジャンプシート、カラムの高さが不自然に崩れないことを確認します。",
		exercisePlans: [
			{
				id: "ep-long",
				memo: "テンポ、ポーズ、グリップ幅など補足が長くなるケースを想定しています。",
				exercise: longNameExercise,
				setPlans: Array.from({ length: 9 }, (_, index) => ({
					id: `sp-long-${index + 1}`,
					pattern: "weight-reps",
					weight: 70 + index * 2.5,
					reps: 8,
				})),
			},
		],
	},
	{
		id: "d-long-2",
		label: "Day 2: 長い名前の下半身トレーニング",
		memo: "複数 Day がある状態でジャンプシートの見え方を確認する。",
		exercisePlans: [
			{
				id: "ep-long-squat",
				memo: null,
				exercise: squat,
				setPlans: [],
			},
		],
	},
];

const baseArgs = {
	name: "5/3/1 BBB",
	meta: "メインリフトは 5/3/1 で、補助は BBB（Boring But Big）。\nDeload week は 4 週ごとに挿入する。",
	days: FULL_DAYS,
	availableExercises: AVAILABLE_EXERCISES,
	defaultSelectedDayId: "d1",
	defaultSelectedExercisePlanId: undefined,
	onAddDay: fn(),
	onDeleteDay: fn(),
	onChangeDayInfo: fn(),
	onChangeProgramInfo: fn(),
	onAddExercisePlanWithSelectedExercise: fn(),
	onAddExercisePlanWithNewExercise: fn(),
	onChangeExercisePlanInfo: fn(),
	onDeleteExercisePlan: fn(),
	onChangeSetPlan: fn(),
	onAddSetPlan: fn(),
	onDeleteSetPlan: fn(),
	renderWorkoutHistory: renderDummyWorkoutHistory,
	renderExerciseProgress: renderDummyExerciseProgress,
} satisfies ProgramDetailNewStoryProps;

const narrowDecorator = [
	(Story: FC) => (
		<div className="max-w-md">
			<Story />
		</div>
	),
];

const meta = {
	title: "View/V2 プログラム詳細 新実装",
	component: ProgramDetailNew,
	parameters: {
		layout: "fullscreen",
	},
	tags: ["autodocs"],
	args: baseArgs,
	decorators: [
		(Story) => (
			<Main width="wide">
				<Story />
			</Main>
		),
	],
	render: (args) => <StatefulProgramDetailNew {...args} />,
} satisfies Meta<typeof ProgramDetailNew>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WideFullProgram: Story = {
	name: "広い画面: すべて揃った状態（編集操作）",
	args: {
		defaultSelectedDayId: "d1",
		defaultSelectedExercisePlanId: "ep-d1-bench",
	},
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		await openDialogFromButton("プログラム情報を編集");
		const programNameInput = await screen.findByRole("textbox", {
			name: "プログラム名",
		});
		await userEvent.clear(programNameInput);
		await userEvent.type(programNameInput, "Strength Base");
		await userEvent.click(screen.getByRole("button", { name: "確定" }));
		await waitFor(() => {
			expect(args.onChangeProgramInfo).toHaveBeenCalledWith({
				name: "Strength Base",
				meta: "メインリフトは 5/3/1 で、補助は BBB（Boring But Big）。\nDeload week は 4 週ごとに挿入する。",
			});
		});
		await expectHeadingPresent(canvas, "Strength Base");

		await openDialogFromButton("Day 1: 上半身プッシュを編集");
		const dayNameInput = await screen.findByRole("textbox", { name: "名前" });
		await userEvent.clear(dayNameInput);
		await userEvent.type(dayNameInput, "Day 1: Push");
		await userEvent.click(screen.getByRole("button", { name: "確定" }));
		await waitFor(() => {
			expect(args.onChangeDayInfo).toHaveBeenCalledWith("d1", {
				label: "Day 1: Push",
				memo: "押す種目をまとめる日。肩の違和感がある日は補助種目を控えめにする。",
			});
		});

		await openDialogFromButton("ベンチプレスのメモを編集");
		const memoInput = await screen.findByRole("textbox", { name: "メモ" });
		await userEvent.clear(memoInput);
		await userEvent.type(memoInput, "胸で止めてから押す。");
		await userEvent.click(screen.getByRole("button", { name: "確定" }));
		await waitFor(() => {
			expect(args.onChangeExercisePlanInfo).toHaveBeenCalledWith(
				"ep-d1-bench",
				{ memo: "胸で止めてから押す。" },
			);
		});

		await openDialogFromButton("ベンチプレス 1セット計画を編集");
		await userEvent.click(await screen.findByRole("button", { name: "確定" }));
		await waitFor(() => {
			expect(args.onChangeSetPlan).toHaveBeenCalledWith("sp-d1-bench-1", {
				pattern: "weight-reps",
				weight: 100,
				reps: 5,
			});
		});
	},
};

export const WideDeleteActions: Story = {
	name: "広い画面: 削除操作",
	args: {
		defaultSelectedDayId: "d1",
		defaultSelectedExercisePlanId: "ep-d1-bench",
	},
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		await userEvent.click(
			canvas.getByRole("button", {
				name: "ベンチプレス 1セット計画を削除",
			}),
		);
		await waitFor(() => {
			expect(args.onDeleteSetPlan).toHaveBeenCalledWith("sp-d1-bench-1");
		});

		await userEvent.click(
			canvas.getByRole("button", {
				name: "ベンチプレスの種目計画を削除",
			}),
		);
		await waitFor(() => {
			expect(args.onDeleteExercisePlan).toHaveBeenCalledWith("ep-d1-bench");
		});

		await userEvent.click(
			canvas.getByRole("button", {
				name: "Day 1: 上半身プッシュを削除",
			}),
		);
		await waitFor(() => {
			expect(args.onDeleteDay).toHaveBeenCalledWith("d1");
		});
	},
};

export const NarrowFullDrilldown: Story = {
	name: "狭い画面: セット計画までドリルダウン（移動操作）",
	decorators: narrowDecorator,
	args: {
		defaultSelectedDayId: "d1",
		defaultSelectedExercisePlanId: "ep-d1-bench",
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await userEvent.click(
			canvas.getByRole("button", { name: "上の階層へ戻る" }),
		);
		await expectTextPresent(canvas, "インクラインダンベルプレス");
		await userEvent.click(
			canvas.getByRole("button", { name: "上の階層へ戻る" }),
		);
		await expectTextPresent(canvas, "Day 2: 下半身");
		await clickFirstButton(canvas, /Day 2: 下半身\s+1\s+種目計画/);
		await expectTextPresent(canvas, "下半身");
	},
};

export const WideRootWithoutSelection: Story = {
	name: "広い画面: 未選択",
	args: {
		defaultSelectedDayId: undefined,
		defaultSelectedExercisePlanId: undefined,
	},
};

export const NarrowRoot: Story = {
	name: "狭い画面: ルート",
	decorators: narrowDecorator,
	args: {
		defaultSelectedDayId: undefined,
		defaultSelectedExercisePlanId: undefined,
	},
};

export const WideEmptyProgram: Story = {
	name: "広い画面: Day なし（Day 追加操作）",
	args: {
		name: "新しいプログラム",
		meta: null,
		days: [],
		defaultSelectedDayId: undefined,
		defaultSelectedExercisePlanId: undefined,
	},
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		await clickFirstButton(canvas, "Day を追加");
		await waitFor(() => {
			expect(args.onAddDay).toHaveBeenCalled();
		});
		await expectTextPresent(canvas, "Day 1");
	},
};

export const NarrowEmptyProgram: Story = {
	name: "狭い画面: Day なし（Day 追加操作）",
	decorators: narrowDecorator,
	args: {
		name: "新しいプログラム",
		meta: null,
		days: [],
		defaultSelectedDayId: undefined,
		defaultSelectedExercisePlanId: undefined,
	},
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		await clickFirstButton(canvas, "Day を追加");
		await waitFor(() => {
			expect(args.onAddDay).toHaveBeenCalled();
		});
		await expectTextPresent(canvas, "Day 1");
	},
};

export const WideSelectedDayWithoutExercisePlans: Story = {
	name: "広い画面: 種目計画なしの Day（既存種目追加操作）",
	args: {
		days: DAY_WITHOUT_EXERCISE_PLANS,
		defaultSelectedDayId: "d-empty",
		defaultSelectedExercisePlanId: undefined,
	},
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		const input = canvas.getByRole("combobox", { name: "種目計画を追加" });
		await userEvent.click(input);
		await userEvent.click(
			await screen.findByRole("option", { name: "ベンチプレス" }),
		);
		await waitFor(() => {
			expect(args.onAddExercisePlanWithSelectedExercise).toHaveBeenCalledWith(
				"d-empty",
				"ex-bench",
			);
		});
		await expectTextPresent(canvas, "ベンチプレス");
	},
};

export const NarrowSelectedDayWithoutExercisePlans: Story = {
	name: "狭い画面: 種目計画なしの Day",
	decorators: narrowDecorator,
	args: {
		days: DAY_WITHOUT_EXERCISE_PLANS,
		defaultSelectedDayId: "d-empty",
		defaultSelectedExercisePlanId: undefined,
	},
};

export const WideSelectedExerciseWithoutSetPlans: Story = {
	name: "広い画面: セット計画なしの種目計画（セット追加操作）",
	args: {
		days: EXERCISE_WITHOUT_SET_PLANS,
		defaultSelectedDayId: "d-no-sets",
		defaultSelectedExercisePlanId: "ep-no-sets",
	},
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		await userEvent.click(
			canvas.getByRole("button", { name: "セット計画を追加" }),
		);
		const dialog = await screen.findByRole("dialog", {
			name: "オーバーヘッドプレス 1セット計画を追加",
		});
		await userEvent.type(
			within(dialog).getByRole("textbox", { name: "重量 (kg)" }),
			"40",
		);
		await userEvent.type(
			within(dialog).getByRole("textbox", { name: "回数" }),
			"8",
		);
		await userEvent.click(within(dialog).getByRole("button", { name: "確定" }));
		await waitFor(() => {
			expect(args.onAddSetPlan).toHaveBeenCalledWith("ep-no-sets", {
				pattern: "weight-reps",
				weight: 40,
				reps: 8,
			});
		});
	},
};

export const NarrowSelectedExerciseWithoutSetPlans: Story = {
	name: "狭い画面: セット計画なしの種目計画",
	decorators: narrowDecorator,
	args: {
		days: EXERCISE_WITHOUT_SET_PLANS,
		defaultSelectedDayId: "d-no-sets",
		defaultSelectedExercisePlanId: "ep-no-sets",
	},
};

export const WideCreateExerciseFromComboBox: Story = {
	name: "広い画面: ComboBox から新規種目作成（追加操作）",
	args: {
		days: CREATE_EXERCISE_DAYS,
		availableExercises: [],
		defaultSelectedDayId: "d-create",
		defaultSelectedExercisePlanId: undefined,
	},
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		const input = canvas.getByRole("combobox", { name: "種目計画を追加" });
		await userEvent.click(input);
		await userEvent.type(input, "チンニング");
		await userEvent.click(
			await screen.findByRole("option", { name: "種目「チンニング」を登録" }),
		);
		await waitFor(() => {
			expect(args.onAddExercisePlanWithNewExercise).toHaveBeenCalledWith(
				"d-create",
				"チンニング",
			);
		});
		await expectTextPresent(canvas, "チンニング");
	},
};

export const NarrowCreateExerciseFromComboBox: Story = {
	name: "狭い画面: ComboBox から新規種目作成",
	decorators: narrowDecorator,
	args: {
		days: CREATE_EXERCISE_DAYS,
		availableExercises: [],
		defaultSelectedDayId: "d-create",
		defaultSelectedExercisePlanId: undefined,
	},
};

export const WideLongContent: Story = {
	name: "広い画面: 長文と多数データ",
	args: {
		name: "5/3/1 BBB と補助種目を長期的に管理するためのとても長いプログラム名",
		meta: "長い説明文の折り返し、複数行メモ、長い種目名、多数セット、外部スロットの表示をまとめて確認するための Story です。",
		days: LONG_CONTENT_DAYS,
		availableExercises: [
			...AVAILABLE_EXERCISES,
			{ id: longNameExercise.id, name: longNameExercise.name },
		],
		defaultSelectedDayId: "d-long-1",
		defaultSelectedExercisePlanId: "ep-long",
	},
};

export const NarrowLongContent: Story = {
	name: "狭い画面: 長文と多数データ",
	decorators: narrowDecorator,
	args: {
		name: "5/3/1 BBB と補助種目を長期的に管理するためのとても長いプログラム名",
		meta: "長い説明文の折り返し、複数行メモ、長い種目名、多数セット、外部スロットの表示をまとめて確認するための Story です。",
		days: LONG_CONTENT_DAYS,
		availableExercises: [
			...AVAILABLE_EXERCISES,
			{ id: longNameExercise.id, name: longNameExercise.name },
		],
		defaultSelectedDayId: "d-long-1",
		defaultSelectedExercisePlanId: "ep-long",
	},
};

export const LoadingWide: Story = {
	name: "ローディング: 広い画面",
	render: () => <ProgramDetailNewLoading />,
};

export const LoadingNarrow: Story = {
	name: "ローディング: 狭い画面",
	decorators: narrowDecorator,
	render: () => <ProgramDetailNewLoading />,
};

export const ErrorWide: Story = {
	name: "エラー: 広い画面",
	render: () => <ProgramDetailNewError />,
};

export const ErrorNarrow: Story = {
	name: "エラー: 狭い画面",
	decorators: narrowDecorator,
	render: () => (
		<ProgramDetailNewError message="ネットワーク接続を確認して再試行してください。" />
	),
};

export const FlowLoadingToProgramWide: Story = {
	name: "フロー: ローディング → 正常表示（広い画面）",
	render: () => <FlowProgramDetailDemo delayMs={800} outcome="success" />,
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		expect(canvas.getByText("プログラム詳細を読み込み中")).toBeInTheDocument();
		await expectHeadingPresent(canvas, "5/3/1 BBB");
	},
};

export const FlowLoadingToErrorWide: Story = {
	name: "フロー: ローディング → エラー（広い画面）",
	render: () => <FlowProgramDetailDemo delayMs={800} outcome="error" />,
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		expect(canvas.getByText("プログラム詳細を読み込み中")).toBeInTheDocument();
		expect(
			await canvas.findByRole("alert", undefined, { timeout: 2000 }),
		).toHaveTextContent("プログラムを取得できませんでした");
	},
};

export const FlowLoadingToProgramNarrow: Story = {
	name: "フロー: ローディング → 正常表示（狭い画面）",
	decorators: narrowDecorator,
	render: () => <FlowProgramDetailDemo delayMs={800} outcome="success" />,
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		expect(canvas.getByText("プログラム詳細を読み込み中")).toBeInTheDocument();
		await expectHeadingPresent(canvas, "5/3/1 BBB");
	},
};

export const FlowLoadingToErrorNarrow: Story = {
	name: "フロー: ローディング → エラー（狭い画面）",
	decorators: narrowDecorator,
	render: () => <FlowProgramDetailDemo delayMs={800} outcome="error" />,
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		expect(canvas.getByText("プログラム詳細を読み込み中")).toBeInTheDocument();
		expect(
			await canvas.findByRole("alert", undefined, { timeout: 2000 }),
		).toHaveTextContent("プログラムを取得できませんでした");
	},
};

const openDialogFromButton = async (name: string) => {
	await userEvent.click(screen.getByRole("button", { name }));
	await waitFor(() => {
		expect(screen.getByRole("dialog")).toBeVisible();
	});
};

type Canvas = ReturnType<typeof within>;

const clickFirstButton = async (canvas: Canvas, name: string | RegExp) => {
	const button = canvas.getAllByRole("button", { name })[0];
	if (button === undefined) {
		throw new Error(`button not found: ${name}`);
	}
	await userEvent.click(button);
};

const expectTextPresent = async (canvas: Canvas, text: string) => {
	await waitFor(() => {
		expect(canvas.getAllByText(text).length).toBeGreaterThan(0);
	});
};

const expectHeadingPresent = async (canvas: Canvas, name: string) => {
	await waitFor(() => {
		expect(canvas.getAllByRole("heading", { name }).length).toBeGreaterThan(0);
	});
};

type FlowOutcome = "success" | "error";

type FlowProgramDetailData = Pick<
	ProgramDetailNewStoryProps,
	| "name"
	| "meta"
	| "days"
	| "availableExercises"
	| "defaultSelectedDayId"
	| "defaultSelectedExercisePlanId"
>;

const FlowProgramDetailDemo: FC<{
	delayMs: number;
	outcome: FlowOutcome;
}> = ({ delayMs, outcome }) => {
	const promise = useMemo(
		() =>
			outcome === "success"
				? fakeFetchProgramDetailSuccess(delayMs)
				: fakeFetchProgramDetailFailure(delayMs),
		[delayMs, outcome],
	);

	return (
		<ErrorBoundary
			key={outcome}
			fallback={
				<ProgramDetailNewError message="ネットワーク接続を確認して再試行してください。" />
			}
		>
			<Suspense fallback={<ProgramDetailNewLoading />}>
				<ProgramDetailContainer promise={promise} />
			</Suspense>
		</ErrorBoundary>
	);
};

const ProgramDetailContainer: FC<{
	promise: Promise<FlowProgramDetailData>;
}> = ({ promise }) => {
	const data = use(promise);
	return <StatefulProgramDetailNew {...baseArgs} {...data} />;
};

const fakeFetchProgramDetailSuccess = (
	delayMs: number,
): Promise<FlowProgramDetailData> =>
	new Promise((resolve) => {
		setTimeout(
			() =>
				resolve({
					name: baseArgs.name,
					meta: baseArgs.meta,
					days: FULL_DAYS,
					availableExercises: AVAILABLE_EXERCISES,
					defaultSelectedDayId: "d1",
					defaultSelectedExercisePlanId: "ep-d1-bench",
				}),
			delayMs,
		);
	});

const fakeFetchProgramDetailFailure = (
	delayMs: number,
): Promise<FlowProgramDetailData> =>
	new Promise((_, reject) => {
		setTimeout(
			() => reject(new Error("プログラム詳細の取得に失敗しました")),
			delayMs,
		);
	});

const StatefulProgramDetailNew: FC<ProgramDetailNewStoryProps> = ({
	name: initialName,
	meta: initialMeta,
	days: initialDays,
	availableExercises: initialAvailableExercises,
	onAddDay,
	onDeleteDay,
	onChangeDayInfo,
	onChangeProgramInfo,
	onAddExercisePlanWithSelectedExercise,
	onAddExercisePlanWithNewExercise,
	onChangeExercisePlanInfo,
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

	const handleAddDay = () => {
		const id = crypto.randomUUID();
		setDays((prev) => [
			...prev,
			{
				id,
				label: `Day ${prev.length + 1}`,
				memo: null,
				exercisePlans: [],
			},
		]);
		onAddDay();
	};

	const handleDeleteDay = (dayId: string) => {
		setDays((prev) => prev.filter((day) => day.id !== dayId));
		onDeleteDay(dayId);
	};

	const handleChangeDayInfo: ProgramDetailNewStoryProps["onChangeDayInfo"] = (
		dayId,
		payload,
	) => {
		setDays((prev) =>
			prev.map((day) =>
				day.id === dayId
					? { ...day, label: payload.label, memo: payload.memo }
					: day,
			),
		);
		onChangeDayInfo(dayId, payload);
	};

	const handleChangeProgramInfo: ProgramDetailNewStoryProps["onChangeProgramInfo"] =
		(payload) => {
			setName(payload.name);
			setMeta(payload.meta);
			onChangeProgramInfo(payload);
		};

	const handleAddExercisePlanWithSelectedExercise = (
		dayId: string,
		exerciseId: string,
	) => {
		const selected = availableExercises.find((item) => item.id === exerciseId);
		if (selected === undefined) return;
		addExercisePlan(dayId, selected);
		onAddExercisePlanWithSelectedExercise(dayId, exerciseId);
	};

	const handleAddExercisePlanWithNewExercise = (
		dayId: string,
		name: string,
	) => {
		const exercise = { id: `ex-new-${Date.now()}`, name };
		setAvailableExercises((prev) => [...prev, exercise]);
		addExercisePlan(dayId, exercise);
		onAddExercisePlanWithNewExercise(dayId, name);
	};

	const handleChangeExercisePlanInfo: ProgramDetailNewStoryProps["onChangeExercisePlanInfo"] =
		(exercisePlanId, payload) => {
			setDays((prev) =>
				prev.map((day) => ({
					...day,
					exercisePlans: day.exercisePlans.map((exercisePlan) =>
						exercisePlan.id === exercisePlanId
							? {
									...exercisePlan,
									memo: payload.memo,
								}
							: exercisePlan,
					),
				})),
			);
			onChangeExercisePlanInfo(exercisePlanId, payload);
		};

	const addExercisePlan = (
		dayId: string,
		exercise: { id: string; name: string },
	) => {
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
										id: exercise.id,
										name: exercise.name,
										weightUnit: "kg",
										weightStep: 2.5,
										detailHref: `/exercises/${exercise.id}`,
									},
									memo: null,
									setPlans: [],
								},
							],
						}
					: day,
			),
		);
		setLastAddedExercisePlanId(newExercisePlanId);
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

	const handleAddSetPlan: ProgramDetailNewStoryProps["onAddSetPlan"] = (
		exercisePlanId,
		payload,
	) => {
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

	const handleChangeSetPlan: ProgramDetailNewStoryProps["onChangeSetPlan"] = (
		setPlanId,
		payload,
	) => {
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
		<ProgramDetailNew
			{...rest}
			name={name}
			meta={meta}
			days={days}
			availableExercises={availableExercises}
			onAddDay={handleAddDay}
			onDeleteDay={handleDeleteDay}
			onChangeDayInfo={handleChangeDayInfo}
			onChangeProgramInfo={handleChangeProgramInfo}
			onAddExercisePlanWithSelectedExercise={
				handleAddExercisePlanWithSelectedExercise
			}
			onAddExercisePlanWithNewExercise={handleAddExercisePlanWithNewExercise}
			onChangeExercisePlanInfo={handleChangeExercisePlanInfo}
			onDeleteExercisePlan={handleDeleteExercisePlan}
			onAddSetPlan={handleAddSetPlan}
			onChangeSetPlan={handleChangeSetPlan}
			onDeleteSetPlan={handleDeleteSetPlan}
			lastAddedExercisePlanId={lastAddedExercisePlanId}
		/>
	);
};
