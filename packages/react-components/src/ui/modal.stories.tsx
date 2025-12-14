"use client";

import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "storybook/test";
import { Button } from "./button";
import {
	Modal,
	ModalBody,
	ModalClose,
	ModalContent,
	ModalDescription,
	ModalFooter,
	ModalHeader,
	ModalTitle,
	ModalTrigger,
} from "./modal";

const meta = {
	title: "UI/Modal",
	component: Modal,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithBody: Story = {
	args: { children: null },
	render: () => (
		<Modal>
			<ModalTrigger>モーダルを開く（Bodyあり）</ModalTrigger>
			<ModalContent size="md">
				<ModalHeader>
					<ModalTitle>タイトル</ModalTitle>
					<ModalDescription>これは説明文です。</ModalDescription>
				</ModalHeader>
				<ModalBody>
					<p>
						これはモーダルのボディです。ModalBodyコンポーネントで囲まれています。
					</p>
					<p>
						DialogFooterの上部にはpaddingがあります（pt-[calc(var(--gutter)---spacing(2))]）。
					</p>
				</ModalBody>
				<ModalFooter>
					<ModalClose>キャンセル</ModalClose>
					<Button intent="primary">確認</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	),
};

export const WithoutBody: Story = {
	args: { children: null },
	render: () => (
		<Modal>
			<ModalTrigger>モーダルを開く（Bodyなし）</ModalTrigger>
			<ModalContent size="md">
				<ModalHeader>
					<ModalTitle>タイトル</ModalTitle>
					<ModalDescription>これは説明文です。</ModalDescription>
				</ModalHeader>
				<ModalFooter>
					<ModalClose>キャンセル</ModalClose>
					<Button intent="primary">確認</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	),
};

export const SizeSmall: Story = {
	args: { children: null },
	render: () => (
		<Modal>
			<ModalTrigger>サイズ: sm</ModalTrigger>
			<ModalContent size="sm">
				<ModalHeader>
					<ModalTitle>Small Modal</ModalTitle>
					<ModalDescription>size="sm" のモーダルです。</ModalDescription>
				</ModalHeader>
				<ModalBody>
					<p>小さめのモーダルです。</p>
				</ModalBody>
				<ModalFooter>
					<ModalClose>閉じる</ModalClose>
				</ModalFooter>
			</ModalContent>
		</Modal>
	),
};

export const SizeLarge: Story = {
	args: { children: null },
	render: () => (
		<Modal>
			<ModalTrigger>サイズ: lg</ModalTrigger>
			<ModalContent size="lg">
				<ModalHeader>
					<ModalTitle>Large Modal</ModalTitle>
					<ModalDescription>size="lg" のモーダルです。</ModalDescription>
				</ModalHeader>
				<ModalBody>
					<p>大きめのモーダルです。</p>
				</ModalBody>
				<ModalFooter>
					<ModalClose>閉じる</ModalClose>
				</ModalFooter>
			</ModalContent>
		</Modal>
	),
};

export const SizeFullscreen: Story = {
	args: { children: null },
	render: () => (
		<Modal>
			<ModalTrigger>サイズ: fullscreen</ModalTrigger>
			<ModalContent size="fullscreen">
				<ModalHeader>
					<ModalTitle>Fullscreen Modal</ModalTitle>
					<ModalDescription>
						size="fullscreen" のモーダルです。画面全体に表示されます。
					</ModalDescription>
				</ModalHeader>
				<ModalBody>
					<p>フルスクリーンモーダルです。Bodyの高さが自動計算されます。</p>
				</ModalBody>
				<ModalFooter>
					<ModalClose>閉じる</ModalClose>
				</ModalFooter>
			</ModalContent>
		</Modal>
	),
};

export const AlertDialog: Story = {
	args: { children: null },
	render: () => (
		<Modal>
			<ModalTrigger intent="danger">削除する</ModalTrigger>
			<ModalContent role="alertdialog" size="md">
				<ModalHeader>
					<ModalTitle>本当に削除しますか？</ModalTitle>
					<ModalDescription>
						この操作は取り消せません。データは完全に削除されます。
					</ModalDescription>
				</ModalHeader>
				<ModalFooter>
					<ModalClose>キャンセル</ModalClose>
					<Button intent="danger">削除</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);

		// モーダルを開く
		const trigger = canvas.getByRole("button", { name: "削除する" });
		await userEvent.click(trigger);

		// role="alertdialog"の場合、isDismissableが自動的にfalseになるため閉じるボタン（×）が非表示
		const dialog = document.querySelector("[data-slot='dialog']");
		expect(dialog).toHaveAttribute("role", "alertdialog");

		const closeIcon = document.querySelector("[aria-label='Close']");
		expect(closeIcon).toBeNull();
	},
};

export const WithBlur: Story = {
	args: { children: null },
	render: () => (
		<Modal>
			<ModalTrigger>ブラー効果あり</ModalTrigger>
			<ModalContent size="md" isBlurred>
				<ModalHeader>
					<ModalTitle>Blurred Background</ModalTitle>
					<ModalDescription>
						isBlurred=true で背景がぼやけます。
					</ModalDescription>
				</ModalHeader>
				<ModalBody>
					<p>背景にブラー効果がかかっています。</p>
				</ModalBody>
				<ModalFooter>
					<ModalClose>閉じる</ModalClose>
				</ModalFooter>
			</ModalContent>
		</Modal>
	),
};

export const WithoutCloseButton: Story = {
	args: { children: null },
	render: () => (
		<Modal>
			<ModalTrigger>閉じるボタンなし</ModalTrigger>
			<ModalContent size="md" closeButton={false}>
				<ModalHeader>
					<ModalTitle>閉じるボタンなし</ModalTitle>
					<ModalDescription>
						closeButton=false で右上の×ボタンが非表示になります。
					</ModalDescription>
				</ModalHeader>
				<ModalBody>
					<p>外側をクリックするか、フッターのボタンで閉じてください。</p>
				</ModalBody>
				<ModalFooter>
					<ModalClose>閉じる</ModalClose>
				</ModalFooter>
			</ModalContent>
		</Modal>
	),
};

export const NotDismissable: Story = {
	args: { children: null },
	render: () => (
		<Modal>
			<ModalTrigger>外クリックで閉じない</ModalTrigger>
			<ModalContent size="md" isDismissable={false}>
				<ModalHeader>
					<ModalTitle>外クリックで閉じない</ModalTitle>
					<ModalDescription>
						isDismissable=false で外側クリックでは閉じません。
					</ModalDescription>
				</ModalHeader>
				<ModalBody>
					<p>
						モーダル外をクリックしても閉じません。フッターのボタンか右上の×で閉じてください。
					</p>
				</ModalBody>
				<ModalFooter>
					<ModalClose>閉じる</ModalClose>
				</ModalFooter>
			</ModalContent>
		</Modal>
	),
};

export const LongContent: Story = {
	args: { children: null },
	render: () => (
		<Modal>
			<ModalTrigger>長いコンテンツ</ModalTrigger>
			<ModalContent size="md">
				<ModalHeader>
					<ModalTitle>長いコンテンツ</ModalTitle>
					<ModalDescription>スクロールが発生するケースです。</ModalDescription>
				</ModalHeader>
				<ModalBody>
					{Array.from({ length: 20 }, (_, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: 静的なダミーデータのため順序変更なし
						<p key={i}>
							これは段落 {i + 1} です。長いコンテンツをシミュレートしています。
						</p>
					))}
				</ModalBody>
				<ModalFooter>
					<ModalClose>閉じる</ModalClose>
				</ModalFooter>
			</ModalContent>
		</Modal>
	),
};
