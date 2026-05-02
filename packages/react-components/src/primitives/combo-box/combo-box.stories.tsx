import type { Meta, StoryObj } from "@storybook/react";
import { useMemo, useState } from "react";
import type { Key } from "react-aria-components";
import { expect, userEvent, waitFor, within } from "storybook/test";
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

const CREATE_OPTION_ID = "__create__";

const CreateNewOptionDemo = () => {
	const [registered, setRegistered] = useState(exercises);
	const [inputValue, setInputValue] = useState("");
	const [selectedKey, setSelectedKey] = useState<Key | null>(null);

	const items = useMemo(() => {
		const trimmed = inputValue.trim();
		const exactMatch = registered.some((e) => e.name === trimmed);
		if (trimmed === "" || exactMatch) {
			return registered;
		}
		return [
			...registered,
			{ id: CREATE_OPTION_ID, name: `「${trimmed}」を登録する` },
		];
	}, [inputValue, registered]);

	const onSelectionChange = (key: Key | null) => {
		if (key === CREATE_OPTION_ID) {
			const trimmed = inputValue.trim();
			const newId = `custom-${Date.now()}`;
			setRegistered((prev) => [...prev, { id: newId, name: trimmed }]);
			setSelectedKey(newId);
			setInputValue(trimmed);
			return;
		}
		setSelectedKey(key);
		const matched = registered.find((e) => e.id === key);
		if (matched !== undefined) {
			setInputValue(matched.name);
		}
	};

	return (
		<ComboBox
			items={items}
			inputValue={inputValue}
			onInputChange={setInputValue}
			selectedKey={selectedKey}
			onSelectionChange={onSelectionChange}
			allowsCustomValue
		>
			<ComboBoxLabel>種目</ComboBoxLabel>
			<ComboBoxInput placeholder="種目名で検索 / 新規登録" />
			<ComboBoxDescription>
				一致する種目がなければ「<strong>○○を登録する</strong>」が候補に出ます
			</ComboBoxDescription>
			<ComboBoxList<{ id: string; name: string }>>
				{(item) =>
					item.id === CREATE_OPTION_ID ? (
						<ComboBoxItem
							id={item.id}
							className="text-primary data-[focused]:bg-primary/10 data-[focused]:text-primary"
						>
							{item.name}
						</ComboBoxItem>
					) : (
						<ComboBoxItem id={item.id}>{item.name}</ComboBoxItem>
					)
				}
			</ComboBoxList>
		</ComboBox>
	);
};

export const CreateNewOption: Story = {
	name: "未登録項目をその場で登録 (拡張性確認)",
	render: () => <CreateNewOptionDemo />,
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const input = canvas.getByRole("combobox");

		// 「懸垂」と入力 (登録済みに存在しない)
		await userEvent.click(input);
		await userEvent.type(input, "懸垂");

		// portal に出る popover から「「懸垂」を登録する」候補を待つ
		const createOption = await waitFor(() => {
			const options = Array.from(
				document.querySelectorAll<HTMLElement>('[role="option"]'),
			);
			const found = options.find((el) =>
				el.textContent?.includes("「懸垂」を登録する"),
			);
			expect(found).toBeDefined();
			return found as HTMLElement;
		});

		// 候補をクリックすると、input が「懸垂」に置き換わる
		await userEvent.click(createOption);
		await waitFor(() => {
			expect(input).toHaveValue("懸垂");
		});

		// 同じ「懸垂」を入力し直しても登録済みになっているので
		// CREATE option は出ず、登録済みの項目が選択候補に出る
		await userEvent.clear(input);
		await userEvent.type(input, "懸垂");
		await waitFor(() => {
			const options = Array.from(
				document.querySelectorAll<HTMLElement>('[role="option"]'),
			);
			const labels = options.map((el) => el.textContent ?? "");
			// 「懸垂」を登録する」候補が消えていること
			expect(labels.some((l) => l.includes("「懸垂」を登録する"))).toBe(false);
			// 登録済みの「懸垂」が候補に出ていること
			expect(labels.some((l) => l.trim() === "懸垂")).toBe(true);
		});
	},
};
