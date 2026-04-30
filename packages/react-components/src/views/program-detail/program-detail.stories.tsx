import type { Meta, StoryObj } from "@storybook/react";
import type { ComponentProps } from "react";
import { PageHeading } from "../../primitives/page-heading";
import { PageSection } from "../../primitives/page-section";
import { ProgramDetail } from "./program-detail";

type Day = ComponentProps<typeof ProgramDetail>["days"][number];

const SAMPLE_DAYS: Day[] = [
	{
		id: "d1",
		label: "Day 1: 上半身プッシュ",
		detailHref: "/programs/p1/days/d1",
	},
	{ id: "d2", label: "Day 2: 下半身", detailHref: "/programs/p1/days/d2" },
	{ id: "d3", label: "Day 3: 上半身プル", detailHref: "/programs/p1/days/d3" },
	{
		id: "d4",
		label: "Day 4: コンディショニング",
		detailHref: "/programs/p1/days/d4",
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
	},
	decorators: [
		(Story) => (
			<PageSection width="wide">
				<PageHeading as="h1">プログラム</PageHeading>
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

export const NewlyCreatedEmptyName: Story = {
	args: {
		name: "",
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
