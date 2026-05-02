import type { Meta, StoryObj } from "@storybook/react";
import {
	ComboBox,
	ComboBoxDescription,
	ComboBoxError,
	ComboBoxInput,
	ComboBoxItem,
	ComboBoxLabel,
	ComboBoxList,
} from "./combo-box";

const exercises = [
	{ id: "bench-press", name: "ベンチプレス" },
	{ id: "incline-bench-press", name: "インクラインベンチプレス" },
	{ id: "dumbbell-press", name: "ダンベルプレス" },
	{ id: "shoulder-press", name: "ショルダープレス" },
	{ id: "lat-pulldown", name: "ラットプルダウン" },
	{ id: "deadlift", name: "デッドリフト" },
	{ id: "squat", name: "スクワット" },
	{ id: "leg-press", name: "レッグプレス" },
	{ id: "leg-extension", name: "レッグエクステンション" },
	{ id: "leg-curl", name: "レッグカール" },
];

const meta = {
	title: "UI/ComboBox",
	component: ComboBox,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
	decorators: [
		(Story) => (
			<div className="w-80">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof ComboBox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<ComboBox aria-label="種目を選択">
			<ComboBoxLabel>種目</ComboBoxLabel>
			<ComboBoxInput placeholder="種目名で検索" />
			<ComboBoxList items={exercises}>
				{(item) => <ComboBoxItem id={item.id}>{item.name}</ComboBoxItem>}
			</ComboBoxList>
		</ComboBox>
	),
};

export const WithDescription: Story = {
	render: () => (
		<ComboBox>
			<ComboBoxLabel>種目</ComboBoxLabel>
			<ComboBoxInput placeholder="種目名で検索" />
			<ComboBoxDescription>
				一覧から選ぶか、入力して絞り込めます
			</ComboBoxDescription>
			<ComboBoxList items={exercises}>
				{(item) => <ComboBoxItem id={item.id}>{item.name}</ComboBoxItem>}
			</ComboBoxList>
		</ComboBox>
	),
};

export const WithDefaultSelection: Story = {
	name: "選択済み",
	render: () => (
		<ComboBox defaultSelectedKey="squat">
			<ComboBoxLabel>種目</ComboBoxLabel>
			<ComboBoxInput placeholder="種目名で検索" />
			<ComboBoxList items={exercises}>
				{(item) => <ComboBoxItem id={item.id}>{item.name}</ComboBoxItem>}
			</ComboBoxList>
		</ComboBox>
	),
};

export const Empty: Story = {
	name: "0件 (まだ種目未登録)",
	render: () => (
		<ComboBox>
			<ComboBoxLabel>種目</ComboBoxLabel>
			<ComboBoxInput placeholder="種目名で検索" />
			<ComboBoxList<{ id: string; name: string }>
				items={[]}
				renderEmptyState={() => (
					<div className="px-3 py-6 text-center text-muted-fg text-sm">
						種目が登録されていません
					</div>
				)}
			>
				{(item) => <ComboBoxItem id={item.id}>{item.name}</ComboBoxItem>}
			</ComboBoxList>
		</ComboBox>
	),
};

export const NoMatches: Story = {
	name: "検索結果なし",
	render: () => (
		<ComboBox defaultInputValue="存在しない種目">
			<ComboBoxLabel>種目</ComboBoxLabel>
			<ComboBoxInput placeholder="種目名で検索" />
			<ComboBoxList
				items={exercises}
				renderEmptyState={() => (
					<div className="px-3 py-6 text-center text-muted-fg text-sm">
						一致する種目がありません
					</div>
				)}
			>
				{(item) => <ComboBoxItem id={item.id}>{item.name}</ComboBoxItem>}
			</ComboBoxList>
		</ComboBox>
	),
};

export const Required: Story = {
	render: () => (
		<ComboBox isRequired>
			<ComboBoxLabel>種目</ComboBoxLabel>
			<ComboBoxInput placeholder="種目名で検索" />
			<ComboBoxList items={exercises}>
				{(item) => <ComboBoxItem id={item.id}>{item.name}</ComboBoxItem>}
			</ComboBoxList>
		</ComboBox>
	),
};

export const Invalid: Story = {
	render: () => (
		<ComboBox isInvalid>
			<ComboBoxLabel>種目</ComboBoxLabel>
			<ComboBoxInput placeholder="種目名で検索" />
			<ComboBoxError>種目を選択してください</ComboBoxError>
			<ComboBoxList items={exercises}>
				{(item) => <ComboBoxItem id={item.id}>{item.name}</ComboBoxItem>}
			</ComboBoxList>
		</ComboBox>
	),
};

export const Disabled: Story = {
	render: () => (
		<ComboBox isDisabled defaultInputValue="ベンチプレス">
			<ComboBoxLabel>種目</ComboBoxLabel>
			<ComboBoxInput />
			<ComboBoxList items={exercises}>
				{(item) => <ComboBoxItem id={item.id}>{item.name}</ComboBoxItem>}
			</ComboBoxList>
		</ComboBox>
	),
};
