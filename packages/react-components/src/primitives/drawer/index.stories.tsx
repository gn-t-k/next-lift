import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../button";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerTitle,
	DrawerTrigger,
} from ".";

const meta = {
	title: "UI/Drawer",
	component: Drawer,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
} satisfies Meta<typeof Drawer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BottomDefault: Story = {
	args: { children: null },
	name: "下から (デフォルト)",
	render: () => (
		<Drawer>
			<DrawerTrigger>下から開く</DrawerTrigger>
			<DrawerContent>
				<DrawerTitle>項目を選択</DrawerTitle>
				<p className="mt-3 text-fg text-sm">
					モバイルの種目選択など、狭い画面で list/form を表示する用途を想定。
				</p>
				<div className="mt-4 flex justify-end gap-2">
					<DrawerClose>閉じる</DrawerClose>
				</div>
			</DrawerContent>
		</Drawer>
	),
};

export const Right: Story = {
	args: { children: null },
	name: "右から (デスクトップサイドパネル)",
	render: () => (
		<Drawer>
			<DrawerTrigger intent="outline">右から開く</DrawerTrigger>
			<DrawerContent placement="right">
				<DrawerTitle>サイドパネル</DrawerTitle>
				<p className="mt-3 text-fg text-sm">
					右からスライドインするパネル。フィルター UI などに使う。
				</p>
				<div className="mt-4 flex justify-end gap-2">
					<DrawerClose>閉じる</DrawerClose>
				</div>
			</DrawerContent>
		</Drawer>
	),
};

export const Left: Story = {
	args: { children: null },
	name: "左から (ナビゲーション)",
	render: () => (
		<Drawer>
			<DrawerTrigger intent="outline">左から開く</DrawerTrigger>
			<DrawerContent placement="left">
				<DrawerTitle>メニュー</DrawerTitle>
				<nav className="mt-4 flex flex-col gap-1">
					<a className="rounded p-2 hover:bg-secondary" href="#a">
						プログラム
					</a>
					<a className="rounded p-2 hover:bg-secondary" href="#b">
						種目
					</a>
					<a className="rounded p-2 hover:bg-secondary" href="#c">
						設定
					</a>
				</nav>
			</DrawerContent>
		</Drawer>
	),
};

export const Top: Story = {
	args: { children: null },
	name: "上から",
	render: () => (
		<Drawer>
			<DrawerTrigger intent="outline">上から開く</DrawerTrigger>
			<DrawerContent placement="top">
				<DrawerTitle>通知</DrawerTitle>
				<p className="mt-3 text-fg text-sm">
					上から降りてくるパネル。フィードバック表示などに。
				</p>
			</DrawerContent>
		</Drawer>
	),
};

export const NoCloseButton: Story = {
	args: { children: null },
	name: "閉じるボタンなし",
	render: () => (
		<Drawer>
			<DrawerTrigger>確認のみ</DrawerTrigger>
			<DrawerContent closeButton={false}>
				<DrawerTitle>確認してください</DrawerTitle>
				<p className="mt-3 text-fg text-sm">
					背景タップ / Escape では閉じられる。明示的なボタンを置きたい場合は
					children に 配置する。
				</p>
				<div className="mt-4 flex justify-end gap-2">
					<DrawerClose>了解</DrawerClose>
				</div>
			</DrawerContent>
		</Drawer>
	),
};

export const NotDismissable: Story = {
	args: { children: null },
	name: "Dismissable 無効",
	render: () => (
		<Drawer>
			<DrawerTrigger>開く</DrawerTrigger>
			<DrawerContent isDismissable={false}>
				<DrawerTitle>意思決定が必要</DrawerTitle>
				<p className="mt-3 text-fg text-sm">
					背景タップ / Escape では閉じられない。明示的に DrawerClose
					を押す必要がある。
				</p>
				<div className="mt-4 flex justify-end gap-2">
					<DrawerClose intent="primary">続行</DrawerClose>
				</div>
			</DrawerContent>
		</Drawer>
	),
};

export const ListContent: Story = {
	args: { children: null },
	name: "リスト内容 (種目選択ビュー想定)",
	render: () => {
		const exercises = [
			"ベンチプレス",
			"インクラインベンチプレス",
			"ダンベルプレス",
			"ショルダープレス",
			"ラットプルダウン",
			"デッドリフト",
			"スクワット",
			"レッグプレス",
			"レッグエクステンション",
			"レッグカール",
		];
		return (
			<Drawer>
				<DrawerTrigger>種目を選ぶ</DrawerTrigger>
				<DrawerContent>
					<DrawerTitle>種目を選択</DrawerTitle>
					<ul className="mt-4 flex flex-col gap-px overflow-y-auto">
						{exercises.map((name) => (
							<li key={name}>
								<Button intent="plain" className="w-full justify-start">
									{name}
								</Button>
							</li>
						))}
					</ul>
				</DrawerContent>
			</Drawer>
		);
	},
};
