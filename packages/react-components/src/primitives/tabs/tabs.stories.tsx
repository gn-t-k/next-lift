import { PlusIcon, TrashIcon } from "@heroicons/react/24/solid";
import type { Meta, StoryObj } from "@storybook/react";
import { type FC, useState } from "react";
import { Button } from "../button/button";
import {
	TextField,
	TextFieldInput,
	TextFieldLabel,
} from "../text-field/text-field";
import { Tab, TabList, TabPanel, Tabs } from "./tabs";

const meta = {
	title: "UI/Tabs",
	component: Tabs,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
	decorators: [
		(Story) => (
			<div className="w-full max-w-xl">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

const days = [
	{ id: "day-1", label: "Day 1", panel: "Day 1 の内容: 上半身プッシュ" },
	{ id: "day-2", label: "Day 2", panel: "Day 2 の内容: 下半身" },
	{ id: "day-3", label: "Day 3", panel: "Day 3 の内容: 上半身プル" },
];

export const Default: Story = {
	render: () => (
		<Tabs>
			<TabList aria-label="Day">
				{days.map((day) => (
					<Tab key={day.id} id={day.id}>
						{day.label}
					</Tab>
				))}
			</TabList>
			{days.map((day) => (
				<TabPanel key={day.id} id={day.id}>
					<p>{day.panel}</p>
				</TabPanel>
			))}
		</Tabs>
	),
};

export const Vertical: Story = {
	render: () => (
		<Tabs orientation="vertical">
			<TabList aria-label="Day">
				{days.map((day) => (
					<Tab key={day.id} id={day.id}>
						{day.label}
					</Tab>
				))}
			</TabList>
			{days.map((day) => (
				<TabPanel key={day.id} id={day.id}>
					<p>{day.panel}</p>
				</TabPanel>
			))}
		</Tabs>
	),
};

const daysWithDisabled = [
	{ id: "day-1", label: "Day 1", panel: "Day 1 の内容", isDisabled: false },
	{ id: "day-2", label: "Day 2", panel: "Day 2 の内容", isDisabled: true },
	{ id: "day-3", label: "Day 3", panel: "Day 3 の内容", isDisabled: false },
];

export const WithDisabled: Story = {
	render: () => (
		<Tabs>
			<TabList aria-label="Day">
				{daysWithDisabled.map((day) => (
					<Tab key={day.id} id={day.id} isDisabled={day.isDisabled}>
						{day.label}
					</Tab>
				))}
			</TabList>
			{daysWithDisabled.map((day) => (
				<TabPanel key={day.id} id={day.id}>
					<p>{day.panel}</p>
				</TabPanel>
			))}
		</Tabs>
	),
};

const manyDays = Array.from({ length: 6 }, (_, i) => ({
	id: `day-${i + 1}`,
	label: `Day ${i + 1}`,
}));

export const ManyTabs: Story = {
	render: () => (
		<Tabs>
			<TabList aria-label="Day">
				{manyDays.map((day) => (
					<Tab key={day.id} id={day.id}>
						{day.label}
					</Tab>
				))}
			</TabList>
			{manyDays.map((day) => (
				<TabPanel key={day.id} id={day.id}>
					{day.label}
				</TabPanel>
			))}
		</Tabs>
	),
};

const WithAddActionDemo: FC = () => {
	const [items, setItems] = useState([
		{ id: "tab-1", label: "Tab 1" },
		{ id: "tab-2", label: "Tab 2" },
	]);
	const handleAdd = () => {
		const next = items.length + 1;
		setItems([...items, { id: `tab-${next}`, label: `Tab ${next}` }]);
	};
	return (
		<Tabs>
			{/* react-aria の TabList は Collection ベースで Tab 以外の子要素は描画されないため、+ ボタンは TabList の兄弟として配置する */}
			<div className="flex items-end gap-1 border-border border-b">
				<TabList aria-label="Tabs" className="border-b-0">
					{items.map((item) => (
						<Tab key={item.id} id={item.id}>
							{item.label}
						</Tab>
					))}
				</TabList>
				<Button
					intent="plain"
					size="sq-sm"
					onPress={handleAdd}
					aria-label="タブを追加"
				>
					<PlusIcon className="size-4" />
				</Button>
			</div>
			{items.map((item) => (
				<TabPanel key={item.id} id={item.id}>
					<p>{item.label} の内容</p>
				</TabPanel>
			))}
		</Tabs>
	);
};

export const WithAddAction: Story = {
	render: () => <WithAddActionDemo />,
};

const EditFromPanelDemo: FC = () => {
	const [items, setItems] = useState([
		{ id: "tab-1", label: "Tab 1" },
		{ id: "tab-2", label: "Tab 2" },
		{ id: "tab-3", label: "Tab 3" },
	]);
	const handleChange = (id: string, label: string) => {
		setItems(items.map((item) => (item.id === id ? { ...item, label } : item)));
	};
	return (
		<Tabs>
			<TabList aria-label="Tabs">
				{items.map((item) => (
					<Tab key={item.id} id={item.id}>
						{item.label}
					</Tab>
				))}
			</TabList>
			{items.map((item) => (
				<TabPanel key={item.id} id={item.id}>
					<TextField
						value={item.label}
						onChange={(value) => handleChange(item.id, value)}
					>
						<TextFieldLabel>ラベル</TextFieldLabel>
						<TextFieldInput />
					</TextField>
				</TabPanel>
			))}
		</Tabs>
	);
};

export const EditFromPanel: Story = {
	render: () => <EditFromPanelDemo />,
};

const DeleteFromPanelDemo: FC = () => {
	const [items, setItems] = useState([
		{ id: "tab-1", label: "Tab 1" },
		{ id: "tab-2", label: "Tab 2" },
		{ id: "tab-3", label: "Tab 3" },
	]);
	const handleDelete = (id: string) => {
		setItems(items.filter((item) => item.id !== id));
	};
	return (
		<Tabs>
			<TabList aria-label="Tabs">
				{items.map((item) => (
					<Tab key={item.id} id={item.id}>
						{item.label}
					</Tab>
				))}
			</TabList>
			{items.map((item) => (
				<TabPanel key={item.id} id={item.id}>
					<div className="flex flex-col items-start gap-3">
						<p>{item.label} の内容</p>
						<Button
							intent="danger"
							size="sm"
							onPress={() => handleDelete(item.id)}
						>
							<TrashIcon className="size-4" />
							削除
						</Button>
					</div>
				</TabPanel>
			))}
		</Tabs>
	);
};

export const DeleteFromPanel: Story = {
	render: () => <DeleteFromPanelDemo />,
};
