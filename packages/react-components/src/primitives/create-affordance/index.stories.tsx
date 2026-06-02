import { PlusIcon } from "@heroicons/react/24/solid";
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "react-aria-components";
import { cn } from "../../libs/utils";
import { createAffordanceClass } from ".";

const meta = {
	title: "UI/CreateAffordance",
	parameters: {
		layout: "padded",
	},
	tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Card: Story = {
	name: "カード型（作成導線）",
	render: () => (
		<Button
			className={cn(
				createAffordanceClass,
				"flex h-full min-h-20 w-full items-center justify-center gap-2 rounded-lg p-4",
			)}
		>
			<PlusIcon className="size-4" aria-hidden />
			<span className="font-medium text-sm">新しいプログラム</span>
		</Button>
	),
};

export const Row: Story = {
	name: "行型（作成導線）",
	render: () => (
		<Button
			className={cn(
				createAffordanceClass,
				"flex w-full items-baseline gap-3 rounded-md px-3 py-2 text-left",
			)}
		>
			<span className="flex-1 truncate">セットを追加</span>
			<PlusIcon className="size-4 shrink-0 self-center" aria-hidden />
		</Button>
	),
};
