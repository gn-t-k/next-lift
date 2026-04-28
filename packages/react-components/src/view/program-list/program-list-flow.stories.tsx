import type { Meta, StoryObj } from "@storybook/react";
import {
	Component,
	type FC,
	type ReactNode,
	Suspense,
	use,
	useMemo,
	useState,
} from "react";
import { Button } from "../../primitive/button";
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

type Programs = Array<{
	id: string;
	name: string;
	lastUsedAt: Date | null;
	href: string;
}>;

const SAMPLE_PROGRAMS: Programs = [
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

// データ取得をモックする Promise。実アプリでは Server Component の await や
// TanStack Query の useSuspenseQuery 等がこの位置に来る
const fakeFetchPrograms = (
	delayMs: number,
	shouldFail: boolean,
): Promise<Programs> =>
	new Promise((resolve, reject) => {
		setTimeout(() => {
			if (shouldFail) {
				reject(new Error("プログラムの取得に失敗しました"));
			} else {
				resolve(SAMPLE_PROGRAMS);
			}
		}, delayMs);
	});

// このストーリー専用のアダプター。Promise を `use()` で待機し、
// 解決後の値で純プレゼンテーショナルな `ProgramList` を呼び出す。
// 実アプリでは Server Component や useSuspenseQuery でこの層を実装する
const SuspendedProgramList: FC<{ promise: Promise<Programs> }> = ({
	promise,
}) => {
	const programs = use(promise);
	return <ProgramList programs={programs} createHref="/programs/new" />;
};

// 簡易 ErrorBoundary（Storybook デモ用）。実アプリでは
// `react-error-boundary` ライブラリの利用を推奨
class StoryErrorBoundary extends Component<
	{ fallback: ReactNode; children: ReactNode },
	{ hasError: boolean }
> {
	override state = { hasError: false };
	static getDerivedStateFromError() {
		return { hasError: true };
	}
	override render() {
		if (this.state.hasError) {
			return this.props.fallback;
		}
		return this.props.children;
	}
}

const FlowContent: FC<Props> = ({ delayMs, outcome }) => {
	const promise = useMemo(
		() => fakeFetchPrograms(delayMs, outcome === "error"),
		[delayMs, outcome],
	);

	return (
		<StoryErrorBoundary
			fallback={
				<ProgramListError
					createHref="/programs/new"
					message="ネットワーク接続を確認して再試行してください。"
				/>
			}
		>
			<Suspense fallback={<ProgramListLoading createHref="/programs/new" />}>
				<SuspendedProgramList promise={promise} />
			</Suspense>
		</StoryErrorBoundary>
	);
};

const FlowDemo: FC<Props> = ({ delayMs, outcome }) => {
	const [replayKey, setReplayKey] = useState(0);

	// delayMs / outcome 変更でも remount して再フェッチ + ErrorBoundary リセット
	const remountKey = `${delayMs}-${outcome}-${replayKey}`;

	return (
		<div>
			<div className="sticky top-0 z-10 flex justify-end px-4 pt-4">
				<Button
					intent="outline"
					size="sm"
					onPress={() => setReplayKey((key) => key + 1)}
				>
					もう一度見る
				</Button>
			</div>
			<PageSection>
				<PageHeading as="h1">プログラム</PageHeading>
				<div key={remountKey}>
					<FlowContent delayMs={delayMs} outcome={outcome} />
				</div>
			</PageSection>
		</div>
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
