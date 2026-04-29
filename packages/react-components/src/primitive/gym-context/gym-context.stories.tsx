import type { Meta, StoryObj } from "@storybook/react";
import type { FC } from "react";
import { GymContext } from "./gym-context";

const DensitySample: FC = () => (
	<div className="space-y-1 rounded-md border border-border p-density-card">
		<div className="text-density-label text-muted-fg">重量</div>
		<div className="font-semibold text-density-value">120 kg × 5</div>
	</div>
);

const meta = {
	title: "UI/GymContext",
	component: GymContext,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
} satisfies Meta<typeof GymContext>;

export default meta;
type Story = StoryObj<typeof meta>;

export const InsideGym: Story = {
	args: { children: null },
	render: () => (
		<GymContext>
			<DensitySample />
		</GymContext>
	),
};

export const OutsideGym: Story = {
	args: { children: null },
	render: () => <DensitySample />,
};

export const SideBySide: Story = {
	args: { children: null },
	render: () => (
		<div className="flex gap-6">
			<div className="space-y-2">
				<p className="font-semibold">ジム外（Compact）</p>
				<DensitySample />
			</div>
			<GymContext className="space-y-2">
				<p className="font-semibold">ジム内（Comfortable）</p>
				<DensitySample />
			</GymContext>
		</div>
	),
};
