import type { Meta, StoryObj } from "@storybook/react";
import { type ComponentProps, type FC, Suspense, use, useMemo } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Heading } from "../../primitives/heading";
import { Main } from "../../primitives/main";
import { ProgramList, ProgramListError, ProgramListLoading } from ".";

const meta = {
	title: "View/V1 プログラム一覧",
	parameters: {
		layout: "fullscreen",
	},
	tags: ["autodocs"],
	decorators: [
		(Story) => (
			<Main width="wide">
				<Heading>プログラム</Heading>
				<Story />
			</Main>
		),
	],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const MultiplePrograms: Story = {
	name: "通常表示",
	render: () => (
		<ProgramList programs={SAMPLE_PROGRAMS} createHref="/programs/new" />
	),
};

export const Mobile: Story = {
	name: "通常表示（モバイル）",
	globals: {
		viewport: { value: "mobile" },
	},
	render: () => (
		<ProgramList programs={SAMPLE_PROGRAMS} createHref="/programs/new" />
	),
};

export const Desktop: Story = {
	name: "通常表示（デスクトップ）",
	globals: {
		viewport: { value: "desktop" },
	},
	render: () => (
		<ProgramList programs={SAMPLE_PROGRAMS} createHref="/programs/new" />
	),
};

export const EmptyPrograms: Story = {
	name: "プログラムが0件",
	render: () => <ProgramList programs={[]} createHref="/programs/new" />,
};

export const LongProgramName: Story = {
	name: "長い名前のプログラム",
	render: () => (
		<ProgramList programs={LONG_NAME_PROGRAMS} createHref="/programs/new" />
	),
};

export const Loading: Story = {
	name: "ローディング状態",
	render: () => <ProgramListLoading createHref="/programs/new" />,
};

export const LoadingMobile: Story = {
	name: "ローディング状態（モバイル）",
	globals: {
		viewport: { value: "mobile" },
	},
	render: () => <ProgramListLoading createHref="/programs/new" />,
};

export const LoadingDesktop: Story = {
	name: "ローディング状態（デスクトップ）",
	globals: {
		viewport: { value: "desktop" },
	},
	render: () => <ProgramListLoading createHref="/programs/new" />,
};

export const ErrorDefault: Story = {
	name: "エラー状態",
	render: () => <ProgramListError createHref="/programs/new" />,
};

export const ErrorWithMessage: Story = {
	name: "エラー状態（メッセージあり）",
	render: () => (
		<ProgramListError
			createHref="/programs/new"
			message="ネットワーク接続を確認して再試行してください。"
		/>
	),
};

export const ErrorMobile: Story = {
	name: "エラー状態（モバイル）",
	globals: {
		viewport: { value: "mobile" },
	},
	render: () => (
		<ProgramListError
			createHref="/programs/new"
			message="ネットワーク接続を確認して再試行してください。"
		/>
	),
};

export const ErrorDesktop: Story = {
	name: "エラー状態（デスクトップ）",
	globals: {
		viewport: { value: "desktop" },
	},
	render: () => (
		<ProgramListError
			createHref="/programs/new"
			message="ネットワーク接続を確認して再試行してください。"
		/>
	),
};

export const FlowLoadingToList: Story = {
	name: "フロー: ローディング → 一覧",
	render: () => <FlowDemo delayMs={1500} outcome="success" />,
};

export const FlowLoadingToError: Story = {
	name: "フロー: ローディング → エラー",
	render: () => <FlowDemo delayMs={1500} outcome="error" />,
};

type Outcome = "success" | "error";

type FlowProps = {
	delayMs: number;
	outcome: Outcome;
};

const FlowDemo: FC<FlowProps> = ({ delayMs, outcome }) => {
	const promise = useMemo(
		() =>
			outcome === "success"
				? fakeFetchProgramsSuccess(delayMs)
				: fakeFetchProgramsFailure(delayMs),
		[delayMs, outcome],
	);

	return (
		<ErrorBoundary
			key={outcome}
			fallback={
				<ProgramListError
					createHref="/programs/new"
					message="ネットワーク接続を確認して再試行してください。"
				/>
			}
		>
			<Suspense fallback={<ProgramListLoading createHref="/programs/new" />}>
				<ProgramListContainer promise={promise} />
			</Suspense>
		</ErrorBoundary>
	);
};

const ProgramListContainer: FC<{ promise: Promise<Program[]> }> = ({
	promise,
}) => {
	const programs = use(promise);
	return <ProgramList programs={programs} createHref="/programs/new" />;
};

const fakeFetchProgramsSuccess = (delayMs: number): Promise<Program[]> =>
	new Promise((resolve) => {
		setTimeout(() => resolve(SAMPLE_PROGRAMS), delayMs);
	});

const fakeFetchProgramsFailure = (delayMs: number): Promise<Program[]> =>
	new Promise((_, reject) => {
		setTimeout(
			() => reject(new Error("プログラムの取得に失敗しました")),
			delayMs,
		);
	});

type Program = ComponentProps<typeof ProgramList>["programs"][number];

const SAMPLE_PROGRAMS: Program[] = [
	{
		id: "p1",
		name: "5/3/1 BBB",
		lastUsedAt: new Date("2026-04-26"),
		href: "/programs/p1",
	},
	{
		id: "p2",
		name: "PPL Hypertrophy",
		lastUsedAt: new Date("2026-04-22"),
		href: "/programs/p2",
	},
	{
		id: "p3",
		name: "GZCLP",
		lastUsedAt: new Date("2026-04-15"),
		href: "/programs/p3",
	},
	{
		id: "p4",
		name: "ストロングリフト 5x5",
		lastUsedAt: new Date("2026-03-30"),
		href: "/programs/p4",
	},
	{
		id: "p5",
		name: "新規プログラム（未使用）",
		lastUsedAt: null,
		href: "/programs/p5",
	},
];

const LONG_NAME_PROGRAMS: Program[] = [
	{
		id: "p1",
		name: "Wendler 5/3/1 Boring But Big with Joker Sets and First Set Last AMRAP Conjugate Method (3-day split, 16-week mesocycle, deload weeks included) 詳細メソッド付きの上級者向け長期プログラム（完全版）",
		lastUsedAt: new Date("2026-04-26"),
		href: "/programs/p1",
	},
	{
		id: "p2",
		name: "上半身重視の高頻度プログラム（プッシュ・プル・レッグ統合型）でボリューム最大化を狙う長期計画 v2.3 改訂版 — 期分けと漸進的過負荷を組み合わせた中級者から上級者向けの本格的なテンプレート",
		lastUsedAt: new Date("2026-04-22"),
		href: "/programs/p2",
	},
	{
		id: "p3",
		name: "5/3/1 BBB",
		lastUsedAt: new Date("2026-04-15"),
		href: "/programs/p3",
	},
];
