import type { Meta, StoryObj } from "@storybook/react";
import { type ComponentProps, type FC, Suspense, use, useMemo } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { PageHeading } from "../../primitive/page-heading";
import { PageSection } from "../../primitive/page-section";
import { ProgramList } from "./program-list";
import { ProgramListError } from "./program-list-error";
import { ProgramListLoading } from "./program-list-loading";

type Outcome = "success" | "error";

type Props = {
	delayMs: number;
	outcome: Outcome;
};

const FlowDemo: FC<Props> = ({ delayMs, outcome }) => {
	const promise = useMemo(
		() =>
			outcome === "success"
				? fakeFetchProgramsSuccess(delayMs)
				: fakeFetchProgramsFailure(delayMs),
		[delayMs, outcome],
	);

	return (
		<PageSection>
			<PageHeading as="h1">プログラム</PageHeading>
			<ErrorBoundary
				key={outcome} // outcome が変わるたびにエラーバウンダリーをリセット
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
		</PageSection>
	);
};

const meta = {
	title: "View/V1 プログラム一覧/Flow",
	component: FlowDemo,
	parameters: {
		layout: "fullscreen",
	},
	tags: ["autodocs"],
	argTypes: {
		delayMs: {
			control: { type: "range", min: 200, max: 5000, step: 100 },
		},
		outcome: {
			control: { type: "radio" },
			options: ["success", "error"] satisfies Outcome[],
		},
	},
	args: {
		delayMs: 1500,
	},
} satisfies Meta<typeof FlowDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LoadingToList: Story = {
	args: {
		outcome: "success",
	},
};

export const LoadingToError: Story = {
	args: {
		outcome: "error",
	},
};

// 実アプリでは Server Component の await や useSuspenseQuery がこの位置に来る
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
];
