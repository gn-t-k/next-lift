import type { Meta, StoryObj } from "@storybook/react";
import type { ComponentProps } from "react";
import { cn } from "../../libs/utils";
import { Button } from "../button/button";
import { ScrollArea } from "./scrollable";

const meta = {
	title: "UI/ScrollArea",
	component: ScrollArea,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
	decorators: [
		(Story) => (
			<div className="w-64 rounded-md border border-border bg-overlay p-2">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof ScrollArea>;

export default meta;
type Story = StoryObj<typeof meta>;

const rpeValues = [
	{ id: "none", label: "なし" },
	{ id: "rpe-6", label: "6" },
	{ id: "rpe-6-5", label: "6.5" },
	{ id: "rpe-7", label: "7" },
	{ id: "rpe-7-5", label: "7.5" },
	{ id: "rpe-8", label: "8" },
	{ id: "rpe-8-5", label: "8.5" },
	{ id: "rpe-9", label: "9" },
	{ id: "rpe-9-5", label: "9.5" },
	{ id: "rpe-10", label: "10" },
	{ id: "rpe-10-5", label: "10.5" },
];

export const Default: Story = {
	render: () => (
		<ScrollArea>
			<div className="flex gap-1">
				{rpeValues.map((rpe) => (
					<Button key={rpe.id} intent="outline" size="sm">
						{rpe.label}
					</Button>
				))}
			</div>
		</ScrollArea>
	),
};

export const Narrow: Story = {
	parameters: {
		layout: "fullscreen",
	},
	decorators: [
		(Story) => (
			<div className="w-48 rounded-md border border-border bg-overlay p-2">
				<Story />
			</div>
		),
	],
	render: () => (
		<ScrollArea>
			<div className="flex gap-1">
				{rpeValues.map((rpe) => (
					<Button key={rpe.id} intent="outline" size="sm">
						{rpe.label}
					</Button>
				))}
			</div>
		</ScrollArea>
	),
};

const manyItems = Array.from({ length: 20 }, (_, i) => ({
	id: `item-${i + 1}`,
	label: `項目 ${i + 1}`,
}));

export const ManyItems: Story = {
	render: () => (
		<ScrollArea>
			<div className="flex gap-1">
				{manyItems.map((item) => (
					<Button key={item.id} intent="secondary" size="sm">
						{item.label}
					</Button>
				))}
			</div>
		</ScrollArea>
	),
};

export const InitialScrollPosition: Story = {
	render: () => {
		const initiallySelectedId = "rpe-8";
		return (
			<ScrollArea scrollAlign="center">
				<div className="flex gap-1">
					{rpeValues.map((rpe) => (
						<Button
							key={rpe.id}
							intent={rpe.id === initiallySelectedId ? "primary" : "outline"}
							size="sm"
							data-initial-scroll={
								rpe.id === initiallySelectedId ? "" : undefined
							}
						>
							{rpe.label}
						</Button>
					))}
				</div>
			</ScrollArea>
		);
	},
};

export const FadeFromPatterns: Story = {
	parameters: {
		layout: "fullscreen",
	},
	decorators: [
		(Story) => (
			<div className="bg-bg p-4">
				<Story />
			</div>
		),
	],
	render: () => (
		<div className="flex flex-col gap-6">
			{fadePatterns.map(({ fadeFrom, containerClassName }) => (
				<section key={fadeFrom} className="flex flex-col gap-1">
					<span className="font-mono text-muted-fg text-xs">
						fadeFrom=&quot;{fadeFrom}&quot;
					</span>
					<div
						className={cn(
							"w-64 rounded-md border border-border p-2",
							containerClassName,
						)}
					>
						<ScrollArea fadeFrom={fadeFrom}>
							<div className="flex gap-1">
								{rpeValues.map((rpe) => (
									<Button key={rpe.id} intent="outline" size="sm">
										{rpe.label}
									</Button>
								))}
							</div>
						</ScrollArea>
					</div>
				</section>
			))}
		</div>
	),
};

type FadeFromValue = NonNullable<ComponentProps<typeof ScrollArea>["fadeFrom"]>;

const fadePatterns: { fadeFrom: FadeFromValue; containerClassName: string }[] =
	[
		{ fadeFrom: "bg", containerClassName: "bg-bg" },
		{ fadeFrom: "overlay", containerClassName: "bg-overlay" },
		{ fadeFrom: "navbar", containerClassName: "bg-navbar" },
		{ fadeFrom: "sidebar", containerClassName: "bg-sidebar" },
		{ fadeFrom: "secondary", containerClassName: "bg-secondary" },
	];
