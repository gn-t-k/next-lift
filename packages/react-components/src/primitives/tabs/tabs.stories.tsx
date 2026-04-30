import type { Meta, StoryObj } from "@storybook/react";
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
