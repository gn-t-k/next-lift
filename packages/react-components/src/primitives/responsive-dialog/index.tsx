"use client";

import type { FC, ReactNode } from "react";
import { tv, type VariantProps } from "tailwind-variants";
import type { useMediaQuery } from "../../libs";
import { Dialog } from "../dialog";
import { Drawer, DrawerContent, DrawerTitle } from "../drawer";
import { Popover, PopoverContent } from "../popover";

type ResponsiveDialogProps = {
	desktopViewport: ReturnType<typeof useMediaQuery>;
	title: string;
	trigger: ReactNode;
	children: ReactNode;
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	role?: "dialog" | "alertdialog";
	popoverWidth: NonNullable<
		VariantProps<typeof popoverContentStyles>["popoverWidth"]
	>;
};

export const ResponsiveDialog: FC<ResponsiveDialogProps> = ({
	desktopViewport,
	title,
	trigger,
	children,
	isOpen,
	onOpenChange,
	role = "dialog",
	popoverWidth,
}) => {
	switch (desktopViewport) {
		case "pending":
			return trigger;
		case "matched":
			return (
				<Popover isOpen={isOpen} onOpenChange={onOpenChange}>
					{trigger}
					<PopoverContent
						placement="bottom end"
						offset={4}
						className={popoverContentStyles({ popoverWidth })}
					>
						<Dialog role={role} aria-label={title}>
							{children}
						</Dialog>
					</PopoverContent>
				</Popover>
			);
		case "unmatched":
			return (
				<Drawer isOpen={isOpen} onOpenChange={onOpenChange}>
					{trigger}
					<DrawerContent role={role}>
						<div className="flex flex-col gap-4 pt-2">
							<DrawerTitle>{title}</DrawerTitle>
							{children}
						</div>
					</DrawerContent>
				</Drawer>
			);
	}
};

const popoverContentStyles = tv({
	base: "p-3",
	variants: {
		popoverWidth: {
			compact: "w-72",
			default: "w-88",
			wide: "w-96",
		},
	},
});
