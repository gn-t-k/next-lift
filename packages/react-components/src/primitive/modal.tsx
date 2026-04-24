"use client";

import type { FC, ReactNode } from "react";
import type {
	DialogProps,
	DialogRenderProps,
	ModalOverlayProps as ModalOverlayPrimitiveProps,
	ModalRenderProps,
} from "react-aria-components";
import {
	DialogTrigger as DialogTriggerPrimitive,
	ModalOverlay as ModalOverlayPrimitive,
	Modal as ModalPrimitive,
} from "react-aria-components";
import { tv, type VariantProps } from "tailwind-variants";
import { cx } from "../lib/primitive";
import {
	Dialog,
	DialogBody,
	DialogClose,
	DialogCloseIcon,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "./dialog";

export const Modal = DialogTriggerPrimitive;
export const ModalTrigger = DialogTrigger;
export const ModalHeader = DialogHeader;
export const ModalTitle = DialogTitle;
export const ModalDescription = DialogDescription;
export const ModalFooter = DialogFooter;
export const ModalBody = DialogBody;
export const ModalClose = DialogClose;

type ModalContentProps = Omit<
	ModalOverlayPrimitiveProps,
	"children" | "className"
> &
	Pick<DialogProps, "aria-label" | "aria-labelledby" | "role" | "children"> &
	VariantProps<typeof contentStyles> & {
		className?: string;
		closeButton?: boolean;
		isBlurred?: boolean;
	};

export const ModalContent: FC<ModalContentProps> = ({
	className,
	isBlurred = false,
	children,
	size,
	role = "dialog",
	closeButton = true,
	...props
}) => {
	const isDismissable = props.isDismissable ?? role !== "alertdialog";

	return (
		<ModalOverlay
			size={size}
			isBlurred={isBlurred}
			isDismissable={isDismissable}
			{...props}
		>
			<ModalContentInner size={size} className={className}>
				<Dialog role={role}>
					{(values: DialogRenderProps) => (
						<>
							{typeof children === "function" ? children(values) : children}
							{closeButton && <DialogCloseIcon isDismissable={isDismissable} />}
						</>
					)}
				</Dialog>
			</ModalContentInner>
		</ModalOverlay>
	);
};

const overlayStyles = tv({
	base: [
		"fixed inset-0 z-50 h-(--visual-viewport-height,100vh) bg-black/15",
		"grid grid-rows-[1fr_auto] justify-items-center sm:grid-rows-[1fr_auto_3fr]",
		"entering:fade-in entering:animate-in entering:duration-300 entering:ease-out",
		"exiting:fade-out exiting:animate-out exiting:ease-in",
	],
	variants: {
		size: {
			"2xs": "md:p-4",
			xs: "md:p-4",
			sm: "md:p-4",
			md: "md:p-4",
			lg: "md:p-4",
			xl: "md:p-4",
			"2xl": "md:p-4",
			"3xl": "md:p-4",
			"4xl": "md:p-4",
			"5xl": "md:p-4",
			fullscreen: "md:p-3",
		},
		isBlurred: {
			true: "backdrop-blur-[1px]",
		},
	},
	defaultVariants: {
		size: "lg",
		isBlurred: false,
	},
});

type ModalOverlayProps = ModalOverlayPrimitiveProps &
	VariantProps<typeof overlayStyles>;

const ModalOverlay: FC<ModalOverlayProps> = ({
	size,
	isBlurred,
	children,
	...props
}) => (
	<ModalOverlayPrimitive
		data-slot="modal-overlay"
		className={overlayStyles({ size, isBlurred })}
		{...props}
	>
		{children}
	</ModalOverlayPrimitive>
);

const contentStyles = tv({
	base: [
		"row-start-2 w-full text-left align-middle [--visual-viewport-vertical-padding:16px]",
		"relative overflow-hidden rounded-t-2xl bg-overlay text-overlay-fg shadow-lg ring ring-fg/5 dark:ring-border",
		"entering:slide-in-from-bottom sm:entering:zoom-in-95 sm:entering:slide-in-from-bottom-0 entering:animate-in entering:duration-300 entering:ease-out",
		"exiting:slide-out-to-bottom sm:exiting:zoom-out-95 sm:exiting:slide-out-to-bottom-0 exiting:animate-out exiting:ease-in",
	],
	variants: {
		size: {
			"2xs":
				"sm:max-w-2xs sm:rounded-xl sm:[--visual-viewport-vertical-padding:32px]",
			xs: "sm:max-w-xs sm:rounded-xl sm:[--visual-viewport-vertical-padding:32px]",
			sm: "sm:max-w-sm sm:rounded-xl sm:[--visual-viewport-vertical-padding:32px]",
			md: "sm:max-w-md sm:rounded-xl sm:[--visual-viewport-vertical-padding:32px]",
			lg: "sm:max-w-lg sm:rounded-xl sm:[--visual-viewport-vertical-padding:32px]",
			xl: "sm:max-w-xl sm:rounded-xl sm:[--visual-viewport-vertical-padding:32px]",
			"2xl":
				"sm:max-w-2xl sm:rounded-xl sm:[--visual-viewport-vertical-padding:32px]",
			"3xl":
				"sm:max-w-3xl sm:rounded-xl sm:[--visual-viewport-vertical-padding:32px]",
			"4xl":
				"sm:max-w-4xl sm:rounded-xl sm:[--visual-viewport-vertical-padding:32px]",
			"5xl":
				"sm:max-w-5xl sm:rounded-xl sm:[--visual-viewport-vertical-padding:32px]",
			fullscreen: [
				// fullscreen時、dialog-bodyの最小高さを「ビューポート高さ - 上下padding - ヘッダー高さ - フッター高さ」に設定し、画面いっぱいに広げる
				"**:data-[slot=dialog-body]:min-h-[calc(var(--visual-viewport-height)-var(--visual-viewport-vertical-padding)-var(--dialog-header-height,0px)-var(--dialog-footer-height,0px))]",
				// sm以上では角丸を小さくし、上下paddingを16pxに縮小（モバイルでは角丸なし・padding大きめ）
				"sm:rounded-md sm:[--visual-viewport-vertical-padding:16px]",
			],
		},
	},
	defaultVariants: {
		size: "lg",
	},
});

type ModalContentInnerProps = VariantProps<typeof contentStyles> & {
	className?: string | undefined;
	children?: ReactNode | ((values: ModalRenderProps) => ReactNode);
};

const ModalContentInner: FC<ModalContentInnerProps> = ({
	size,
	className,
	children,
}) => (
	<ModalPrimitive
		data-slot="modal-content"
		className={cx([contentStyles({ size }), className])}
	>
		{children}
	</ModalPrimitive>
);
