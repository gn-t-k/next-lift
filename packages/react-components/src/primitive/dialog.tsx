"use client";

import { XMarkIcon } from "@heroicons/react/24/solid";
import type { ComponentProps, FC, ReactNode } from "react";
import type { DialogRenderProps, HeadingProps } from "react-aria-components";
import {
	Heading,
	Button as PrimitiveButton,
	Dialog as PrimitiveDialog,
} from "react-aria-components";
import { cn } from "../lib/utils";
import { Button } from "./button";

type DialogProps = {
	role?: "dialog" | "alertdialog";
	className?: string;
	children?: ReactNode | ((opts: DialogRenderProps) => ReactNode);
};

export const Dialog: FC<DialogProps> = ({
	role = "dialog",
	className,
	...props
}) => {
	return (
		<PrimitiveDialog
			data-slot="dialog"
			role={role}
			className={cn(
				"relative flex flex-col overflow-hidden outline-hidden",
				"[--gutter:--spacing(6)] sm:[--gutter:--spacing(8)]",
				// DialogFooterで親要素の状態を参照するために必要
				"peer/dialog group/dialog",
				// ビューポートの高さからパディングを引いた値を最大高さとする
				"max-h-[calc(var(--visual-viewport-height)-var(--visual-viewport-vertical-padding))]",
				className,
			)}
			{...props}
		/>
	);
};

export const DialogTrigger = Button;

type DialogHeaderProps = {
	title?: string;
	description?: string;
	className?: string;
	children?: ReactNode;
};

export const DialogHeader: FC<DialogHeaderProps> = ({
	className,
	title,
	description,
	children,
}) => {
	return (
		<div
			data-slot="dialog-header"
			className={cn(
				"relative space-y-1 p-(--gutter) pb-[calc(var(--gutter)---spacing(3))]",
				className,
			)}
		>
			{title && <DialogTitle>{title}</DialogTitle>}
			{description && <DialogDescription>{description}</DialogDescription>}
			{!title && typeof children === "string" ? (
				<DialogTitle>{children}</DialogTitle>
			) : (
				children
			)}
		</div>
	);
};

type DialogTitleProps = HeadingProps & {
	ref?: React.Ref<HTMLHeadingElement>;
};

export const DialogTitle: FC<DialogTitleProps> = ({ className, ...props }) => (
	<Heading
		slot="title"
		className={cn(
			"text-balance font-semibold text-fg text-lg/6 sm:text-base/6",
			className,
		)}
		{...props}
	/>
);

type DialogDescriptionProps = {
	className?: string;
	children?: ReactNode;
	ref?: React.Ref<HTMLDivElement>;
};

export const DialogDescription: FC<DialogDescriptionProps> = ({
	className,
	...props
}) => (
	<p
		data-slot="description"
		className={cn(
			"text-pretty text-base/6 text-muted-fg group-disabled:opacity-50 sm:text-sm/6",
			className,
		)}
		{...props}
	/>
);

type DialogBodyProps = {
	className?: string;
	children?: ReactNode;
};

export const DialogBody: FC<DialogBodyProps> = ({ className, ...props }) => (
	<div
		data-slot="dialog-body"
		className={cn(
			"isolate flex min-h-0 flex-1 flex-col overflow-auto px-(--gutter) py-1",
			// この要素のどこかの子孫に`data-slot="dialog-footer"`を持つ要素があれば、その要素に`px-0 pt-0`を適用する
			"**:data-[slot=dialog-footer]:px-0 **:data-[slot=dialog-footer]:pt-0",
			className,
		)}
		{...props}
	/>
);

type DialogFooterProps = {
	className?: string;
	children?: ReactNode;
};

export const DialogFooter: FC<DialogFooterProps> = ({
	className,
	...props
}) => {
	return (
		<div
			data-slot="dialog-footer"
			className={cn(
				"isolate mt-auto flex flex-col-reverse justify-end gap-3 sm:flex-row",
				"p-(--gutter) pt-[calc(var(--gutter)---spacing(2))]",
				// DialogBodyがない場合はpaddingを削除（Header直下にFooterが来るため余白が不要）
				"group-not-has-data-[slot=dialog-body]/dialog:pt-0",
				"group-not-has-data-[slot=dialog-body]/popover:pt-0",
				className,
			)}
			{...props}
		/>
	);
};

type DialogCloseProps = ComponentProps<typeof Button>;

export const DialogClose: FC<DialogCloseProps> = ({
	intent = "plain",
	...props
}) => {
	return <Button slot="close" intent={intent} {...props} />;
};

type DialogCloseIconProps = {
	className?: string;
	isDismissable?: boolean | undefined;
};

export const DialogCloseIcon: FC<DialogCloseIconProps> = ({
	className,
	isDismissable,
}) => {
	return isDismissable ? (
		<PrimitiveButton
			aria-label="Close"
			slot="close"
			className={cn(
				"absolute top-1 right-1 z-50 grid size-8 place-content-center rounded-xl",
				"hover:bg-secondary focus:bg-secondary focus:outline-hidden focus-visible:ring-1 focus-visible:ring-primary",
				"sm:top-2 sm:right-2 sm:size-7 sm:rounded-md",
				className,
			)}
		>
			<XMarkIcon className="size-4" />
		</PrimitiveButton>
	) : null;
};
