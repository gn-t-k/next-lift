import type { Meta, StoryObj } from "@storybook/react";
import { type FC, useEffect, useState } from "react";
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

const SAMPLE_PROGRAMS = [
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

const FlowContent: FC<Props> = ({ delayMs, outcome }) => {
	const [resolved, setResolved] = useState(false);

	useEffect(() => {
		const timer = setTimeout(() => setResolved(true), delayMs);
		return () => clearTimeout(timer);
	}, [delayMs]);

	if (!resolved) {
		return <ProgramListLoading createHref="/programs/new" />;
	}

	if (outcome === "error") {
		return (
			<ProgramListError
				createHref="/programs/new"
				message="ネットワーク接続を確認して再試行してください。"
			/>
		);
	}

	return <ProgramList programs={SAMPLE_PROGRAMS} createHref="/programs/new" />;
};

const FlowDemo: FC<Props> = ({ delayMs, outcome }) => {
	const [replayKey, setReplayKey] = useState(0);

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
				<FlowContent key={replayKey} delayMs={delayMs} outcome={outcome} />
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
