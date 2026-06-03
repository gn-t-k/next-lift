import { CalendarDaysIcon } from "@heroicons/react/24/solid";
import type { Meta, StoryObj } from "@storybook/react";
import { cn } from "../../libs/utils";
import { Link } from "../link";
import { surfaceCardClass } from ".";

const meta = {
	title: "UI/SurfaceCard",
	parameters: {
		layout: "padded",
	},
	tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Interactive: Story = {
	name: "interactive（hover / focus で確認）",
	render: () => (
		<Link
			href="/programs/example"
			className={cn(surfaceCardClass, "block h-full min-h-20 w-full p-4")}
		>
			<span className="block font-medium text-base">プッシュ A</span>
			<span className="mt-1 block text-muted-fg text-xs">
				最終使用 2026/06/01
			</span>
		</Link>
	),
};

export const InList: Story = {
	name: "リスト内での利用",
	render: () => (
		<ul className="grid grid-cols-1 gap-2 sm:grid-cols-3">
			{["プッシュ A", "プル A", "レッグ A"].map((name) => (
				<li key={name}>
					<Link
						href="/programs/example"
						className={cn(surfaceCardClass, "block h-full min-h-20 w-full p-4")}
					>
						<span className="flex items-center gap-2 font-medium text-base">
							<CalendarDaysIcon
								data-slot="icon"
								className="size-4"
								aria-hidden
							/>
							{name}
						</span>
						<span className="mt-1 block text-muted-fg text-xs">
							最終使用 2026/06/01
						</span>
					</Link>
				</li>
			))}
		</ul>
	),
};
