import type { Meta, StoryObj } from "@storybook/react";
import { cn } from "../../libs/utils";
import { skeletonClass } from ".";

const meta = {
	title: "UI/Skeleton",
	parameters: {
		layout: "padded",
	},
	tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Blocks: Story = {
	name: "基本ブロック（className でサイズ指定）",
	render: () => (
		<div className="flex flex-col gap-2">
			<div className={cn(skeletonClass, "h-5 w-2/3")} />
			<div className={cn(skeletonClass, "h-3 w-1/3")} />
			<div className={cn(skeletonClass, "size-12 rounded-full")} />
		</div>
	),
};

export const CardLoading: Story = {
	name: "ビューのレイアウトに合成した loading",
	render: () => (
		<ul className="grid grid-cols-1 gap-2 sm:grid-cols-3" aria-busy>
			{["s1", "s2", "s3"].map((key) => (
				<li
					key={key}
					className="h-full min-h-20 w-full rounded-lg bg-overlay p-4 shadow-sm"
				>
					<div className={cn(skeletonClass, "h-5 w-2/3")} />
					<div className={cn(skeletonClass, "mt-2 h-3 w-1/3")} />
				</li>
			))}
		</ul>
	),
};
