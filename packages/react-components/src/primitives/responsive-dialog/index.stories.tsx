"use client";

import type { Meta, StoryObj } from "@storybook/react";
import { type ComponentProps, type FC, useState } from "react";
import { expect, screen, userEvent, waitFor, within } from "storybook/test";
import { Button } from "../button";
import { ResponsiveDialog } from ".";

type ResponsiveDialogStoryProps = ComponentProps<typeof ResponsiveDialog>;

const ControlledResponsiveDialog: FC<ResponsiveDialogStoryProps> = (props) => {
	const [isOpen, setIsOpen] = useState(false);
	return (
		<ResponsiveDialog {...props} isOpen={isOpen} onOpenChange={setIsOpen} />
	);
};

const meta = {
	title: "UI/ResponsiveDialog",
	component: ResponsiveDialog,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
	args: {
		desktopViewport: "matched",
		title: "内容を編集",
		trigger: <Button>開く</Button>,
		children: <p className="text-fg text-sm">フォーム本体</p>,
		isOpen: false,
		onOpenChange: () => undefined,
		popoverWidth: "default",
	},
	render: (args) => <ControlledResponsiveDialog {...args} />,
} satisfies Meta<typeof ResponsiveDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DesktopPopover: Story = {
	name: "Desktop: Popover",
	args: {
		desktopViewport: "matched",
		title: "デスクトップ編集",
		children: <p className="text-fg text-sm">デスクトップの内容</p>,
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await userEvent.click(canvas.getByRole("button", { name: "開く" }));
		const dialog = await screen.findByRole("dialog", {
			name: "デスクトップ編集",
		});
		expect(within(dialog).getByText("デスクトップの内容")).toBeVisible();
		expect(within(dialog).queryByText("デスクトップ編集")).toBeNull();
	},
};

export const MobileDrawer: Story = {
	name: "Mobile: Drawer",
	args: {
		desktopViewport: "unmatched",
		title: "モバイル編集",
		children: <p className="text-fg text-sm">モバイルの内容</p>,
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await userEvent.click(canvas.getByRole("button", { name: "開く" }));
		const dialog = await screen.findByRole("dialog", {
			name: "モバイル編集",
		});
		expect(within(dialog).getByText("モバイル編集")).toBeVisible();
		expect(within(dialog).getByText("モバイルの内容")).toBeVisible();
	},
};

export const AlertDialogRole: Story = {
	name: "Role: alertdialog",
	args: {
		desktopViewport: "matched",
		title: "削除確認",
		role: "alertdialog",
		children: <p className="text-fg text-sm">削除します。</p>,
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await userEvent.click(canvas.getByRole("button", { name: "開く" }));
		const dialog = await screen.findByRole("alertdialog", {
			name: "削除確認",
		});
		await waitFor(() => {
			expect(within(dialog).getByText("削除します。")).toBeVisible();
		});
	},
};
