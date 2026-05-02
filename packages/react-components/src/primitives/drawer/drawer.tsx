"use client";

import { XMarkIcon } from "@heroicons/react/24/solid";
import type { ComponentProps, FC, ReactNode } from "react";
import {
	DialogTrigger as DialogTriggerPrimitive,
	ModalOverlay as ModalOverlayPrimitive,
	type ModalOverlayProps,
	Modal as ModalPrimitive,
	Button as PrimitiveButton,
	Dialog as PrimitiveDialog,
	Heading as PrimitiveHeading,
	type HeadingProps as PrimitiveHeadingProps,
} from "react-aria-components";
import { tv, type VariantProps } from "tailwind-variants";
import { cx } from "../../libs/primitive";
import { cn } from "../../libs/utils";
import { Button } from "../button";

export const Drawer = DialogTriggerPrimitive;
export const DrawerTrigger = Button;

export const DrawerClose: FC<ComponentProps<typeof Button>> = ({
	intent = "plain",
	...props
}) => <Button slot="close" intent={intent} {...props} />;

const drawerPanelStyles = tv({
	base: [
		"fixed z-50 flex flex-col bg-overlay text-overlay-fg shadow-lg outline-hidden",
		"border-border",
		"transform-gpu transition ease-in-out will-change-transform",
		"entering:animate-in entering:duration-300",
		"exiting:animate-out exiting:duration-200",
	],
	variants: {
		placement: {
			bottom: [
				"inset-x-0 bottom-0 max-h-[90dvh] rounded-t-2xl border-t",
				"entering:slide-in-from-bottom",
				"exiting:slide-out-to-bottom",
			],
			top: [
				"inset-x-0 top-0 max-h-[90dvh] rounded-b-2xl border-b",
				"entering:slide-in-from-top",
				"exiting:slide-out-to-top",
			],
			left: [
				"inset-y-0 left-0 h-dvh w-3/4 max-w-80 border-r",
				"entering:slide-in-from-left",
				"exiting:slide-out-to-left",
			],
			right: [
				"inset-y-0 right-0 h-dvh w-3/4 max-w-80 border-l",
				"entering:slide-in-from-right",
				"exiting:slide-out-to-right",
			],
		},
	},
	defaultVariants: {
		placement: "bottom",
	},
});

type DrawerContentProps = Omit<ModalOverlayProps, "children" | "className"> & {
	className?: string;
	role?: "dialog" | "alertdialog";
	"aria-label"?: string;
	"aria-labelledby"?: string;
	closeButton?: boolean;
	children?: ReactNode;
} & VariantProps<typeof drawerPanelStyles>;

const overlayClass = [
	"fixed inset-0 z-50 bg-black/30",
	"entering:fade-in entering:animate-in entering:duration-300",
	"exiting:fade-out exiting:animate-out exiting:duration-200",
].join(" ");

export const DrawerContent: FC<DrawerContentProps> = ({
	className,
	placement,
	role = "dialog",
	closeButton = true,
	children,
	isDismissable: isDismissableProp,
	...props
}) => {
	const isDismissable = isDismissableProp ?? role !== "alertdialog";
	return (
		<ModalOverlayPrimitive
			isDismissable={isDismissable}
			className={cx(overlayClass)}
			{...props}
		>
			<ModalPrimitive
				className={cx(drawerPanelStyles({ placement }), className)}
			>
				<PrimitiveDialog
					role={role}
					className={cn(
						"relative flex max-h-[inherit] flex-col overflow-hidden p-6 outline-hidden sm:p-5",
					)}
				>
					{children}
					{closeButton && isDismissable && (
						<PrimitiveButton
							aria-label="閉じる"
							slot="close"
							className={cn(
								"absolute top-2 right-2 grid size-8 place-content-center rounded-md",
								"text-muted-fg hover:bg-secondary hover:text-fg",
								"focus:bg-secondary focus:outline-hidden focus-visible:ring-2 focus-visible:ring-ring",
								"sm:size-7",
							)}
						>
							<XMarkIcon className="size-4" />
						</PrimitiveButton>
					)}
				</PrimitiveDialog>
			</ModalPrimitive>
		</ModalOverlayPrimitive>
	);
};

type DrawerTitleProps = PrimitiveHeadingProps;

export const DrawerTitle: FC<DrawerTitleProps> = ({ className, ...props }) => (
	<PrimitiveHeading
		slot="title"
		className={cn(
			"text-balance pr-8 font-semibold text-fg text-lg/6 sm:text-base/6",
			className,
		)}
		{...props}
	/>
);
