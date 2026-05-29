import {
	DocumentDuplicateIcon,
	EllipsisVerticalIcon,
	PencilSquareIcon,
	TrashIcon,
} from "@heroicons/react/24/outline";
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../button";
import { Menu, MenuItem, MenuSeparator, MenuTrigger } from ".";

const meta = {
	title: "UI/Menu",
	component: Menu,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
} satisfies Meta<typeof Menu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<MenuTrigger>
			<Button intent="outline">アクション</Button>
			<Menu>
				<MenuItem>複製</MenuItem>
				<MenuItem>名前を変更</MenuItem>
				<MenuItem>共有</MenuItem>
			</Menu>
		</MenuTrigger>
	),
};

export const WithSeparator: Story = {
	name: "セパレーターあり",
	render: () => (
		<MenuTrigger>
			<Button intent="outline">プログラム操作</Button>
			<Menu>
				<MenuItem>複製</MenuItem>
				<MenuItem>名前を変更</MenuItem>
				<MenuSeparator />
				<MenuItem intent="danger">削除</MenuItem>
			</Menu>
		</MenuTrigger>
	),
};

export const ProgramContextMenu: Story = {
	name: "プログラム コンテキストメニュー",
	render: () => (
		<MenuTrigger>
			<Button intent="plain" size="sq-sm" aria-label="プログラム操作">
				<EllipsisVerticalIcon data-slot="icon" />
			</Button>
			<Menu>
				<MenuItem>
					<DocumentDuplicateIcon className="size-4" aria-hidden />
					複製
				</MenuItem>
				<MenuItem>
					<PencilSquareIcon className="size-4" aria-hidden />
					名前を変更
				</MenuItem>
				<MenuSeparator />
				<MenuItem intent="danger">
					<TrashIcon className="size-4" aria-hidden />
					削除
				</MenuItem>
			</Menu>
		</MenuTrigger>
	),
};

export const DangerOnly: Story = {
	name: "削除のみ (Day 削除等)",
	render: () => (
		<MenuTrigger>
			<Button intent="plain" size="sq-sm" aria-label="Day 操作">
				<EllipsisVerticalIcon data-slot="icon" />
			</Button>
			<Menu>
				<MenuItem intent="danger">
					<TrashIcon className="size-4" aria-hidden />
					Day を削除
				</MenuItem>
			</Menu>
		</MenuTrigger>
	),
};

export const DisabledItem: Story = {
	name: "無効な項目あり",
	render: () => (
		<MenuTrigger>
			<Button intent="outline">アクション</Button>
			<Menu>
				<MenuItem>複製</MenuItem>
				<MenuItem isDisabled>共有 (準備中)</MenuItem>
				<MenuSeparator />
				<MenuItem intent="danger">削除</MenuItem>
			</Menu>
		</MenuTrigger>
	),
};

export const PlacementBottomEnd: Story = {
	name: "配置: bottom end",
	render: () => (
		<MenuTrigger>
			<Button intent="outline">右下に表示</Button>
			<Menu placement="bottom end">
				<MenuItem>項目 1</MenuItem>
				<MenuItem>項目 2</MenuItem>
				<MenuItem>項目 3</MenuItem>
			</Menu>
		</MenuTrigger>
	),
};
