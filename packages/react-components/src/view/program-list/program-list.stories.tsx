import type { Meta, StoryObj } from "@storybook/react";
import { ProgramList } from "./index";

const meta = {
	title: "View/V1 プログラム一覧",
	component: ProgramList,
	parameters: {
		layout: "fullscreen",
	},
	tags: ["autodocs"],
	args: {
		createHref: "/programs/new",
	},
} satisfies Meta<typeof ProgramList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MultiplePrograms: Story = {
	args: {
		programs: [
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
		],
	},
};

export const EmptyPrograms: Story = {
	args: {
		programs: [],
	},
};

export const LongProgramName: Story = {
	args: {
		programs: [
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
		],
	},
};
