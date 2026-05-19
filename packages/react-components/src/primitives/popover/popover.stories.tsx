"use client";

import type { Meta, StoryObj } from "@storybook/react";
import { Dialog } from "react-aria-components";
import { Button } from "../button";
import { Popover, PopoverContent } from "./popover";

const meta = {
	title: "UI/Popover",
	component: Popover,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: { children: null },
	render: () => (
		<Popover>
			<Button>ポップオーバーを開く</Button>
			<PopoverContent placement="bottom">
				<Dialog className="p-4 outline-hidden" aria-label="ポップオーバー">
					<p className="text-fg text-sm">
						Popover の基本利用例。シェルは primitive 側に内蔵されている。
					</p>
				</Dialog>
			</PopoverContent>
		</Popover>
	),
};

export const PlacementTop: Story = {
	args: { children: null },
	name: "配置: top",
	render: () => (
		<Popover>
			<Button>上に表示</Button>
			<PopoverContent placement="top">
				<Dialog className="p-4 outline-hidden" aria-label="上配置">
					<p className="text-fg text-sm">placement="top"</p>
				</Dialog>
			</PopoverContent>
		</Popover>
	),
};

export const PlacementLeft: Story = {
	args: { children: null },
	name: "配置: left",
	render: () => (
		<Popover>
			<Button>左に表示</Button>
			<PopoverContent placement="left">
				<Dialog className="p-4 outline-hidden" aria-label="左配置">
					<p className="text-fg text-sm">placement="left"</p>
				</Dialog>
			</PopoverContent>
		</Popover>
	),
};

export const PlacementRight: Story = {
	args: { children: null },
	name: "配置: right",
	render: () => (
		<Popover>
			<Button>右に表示</Button>
			<PopoverContent placement="right">
				<Dialog className="p-4 outline-hidden" aria-label="右配置">
					<p className="text-fg text-sm">placement="right"</p>
				</Dialog>
			</PopoverContent>
		</Popover>
	),
};

export const WithMaxWidth: Story = {
	args: { children: null },
	name: "幅制約付き (フォーム想定)",
	render: () => (
		<Popover>
			<Button>フォームを開く</Button>
			<PopoverContent
				placement="bottom end"
				className="max-w-[min(22rem,calc(100vw-2rem))]"
			>
				<Dialog className="w-88 p-3 outline-hidden" aria-label="フォーム">
					<p className="text-fg text-sm">
						consumer が className で幅制約を上書きできる。
					</p>
				</Dialog>
			</PopoverContent>
		</Popover>
	),
};
