import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { fn } from "storybook/test";
import { ExerciseSelector, type SelectableExercise } from "./exercise-selector";

const SAMPLE_EXERCISES: SelectableExercise[] = [
	{ id: "ex-bench", name: "ベンチプレス" },
	{ id: "ex-incline-db", name: "インクラインダンベルプレス" },
	{ id: "ex-pushdown", name: "トライセプスプッシュダウン" },
	{ id: "ex-squat", name: "バックスクワット" },
	{ id: "ex-deadlift", name: "デッドリフト" },
	{ id: "ex-row", name: "ベントオーバーロウ" },
	{ id: "ex-pulldown", name: "ラットプルダウン" },
	{ id: "ex-shoulder-press", name: "ショルダープレス" },
	{ id: "ex-leg-press", name: "レッグプレス" },
	{ id: "ex-leg-curl", name: "レッグカール" },
];

const meta = {
	title: "View/V2 プログラム詳細/ExerciseSelector",
	component: ExerciseSelector,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
	args: {
		availableExercises: SAMPLE_EXERCISES,
		onSelect: fn(),
	},
	decorators: [
		(Story) => (
			<div className="w-80">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof ExerciseSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DesktopPopover: Story = {
	name: "広画面 (Popover)",
	globals: {
		viewport: { value: "desktop" },
	},
};

export const MobileDrawer: Story = {
	name: "狭画面 (Drawer)",
	globals: {
		viewport: { value: "mobile" },
	},
};

export const Empty: Story = {
	name: "種目登録 0 件",
	args: {
		availableExercises: [],
	},
	globals: {
		viewport: { value: "desktop" },
	},
};

export const EmptyMobile: Story = {
	name: "種目登録 0 件 (Drawer)",
	args: {
		availableExercises: [],
	},
	globals: {
		viewport: { value: "mobile" },
	},
};

export const WithCreate: Story = {
	name: "新規追加可能 (Popover)",
	args: {
		onCreateExercise: fn(),
	},
	globals: {
		viewport: { value: "desktop" },
	},
};

export const WithCreateMobile: Story = {
	name: "新規追加可能 (Drawer)",
	args: {
		onCreateExercise: fn(),
	},
	globals: {
		viewport: { value: "mobile" },
	},
};

const InteractiveDemo = () => {
	const [exercises, setExercises] = useState<SelectableExercise[]>([
		{ id: "ex-bench", name: "ベンチプレス" },
		{ id: "ex-squat", name: "バックスクワット" },
	]);
	const [selectedName, setSelectedName] = useState<string | null>(null);

	const handleSelect = (id: string) => {
		const found = exercises.find((exercise) => exercise.id === id);
		setSelectedName(found?.name ?? null);
	};

	const handleCreate = (name: string) => {
		const id = `ex-${Date.now()}`;
		setExercises((prev) => [...prev, { id, name }]);
		setSelectedName(name);
	};

	return (
		<div className="flex flex-col gap-4">
			<ExerciseSelector
				availableExercises={exercises}
				onSelect={handleSelect}
				onCreateExercise={handleCreate}
			/>
			<p className="text-muted-fg text-sm">
				選択中: <span className="text-fg">{selectedName ?? "-"}</span>
			</p>
			<p className="text-muted-fg text-sm">登録済み: {exercises.length} 件</p>
		</div>
	);
};

export const Interactive: Story = {
	name: "インタラクティブ（選択 + 新規追加の動作確認）",
	render: () => <InteractiveDemo />,
};
