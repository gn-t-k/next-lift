import type { FC, PropsWithChildren, ReactNode } from "react";
import { Dialog } from "react-aria-components";
import type { useMediaQuery } from "../../../libs";
import { Drawer, DrawerContent, DrawerTitle } from "../../../primitives/drawer";
import { Popover, PopoverContent } from "../../../primitives/popover";

type Props = PropsWithChildren<{
	title: string;
	trigger: ReactNode;
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	desktopViewport: ReturnType<typeof useMediaQuery>;
}>;

export const DayRenameDialog: FC<Props> = ({
	title,
	trigger,
	isOpen,
	onOpenChange,
	desktopViewport,
	children,
}) => {
	switch (desktopViewport) {
		case "pending":
			return null;
		case "matched":
			return (
				<Popover isOpen={isOpen} onOpenChange={onOpenChange}>
					{trigger}
					<PopoverContent
						placement="bottom end"
						offset={4}
						className="w-72 p-3"
					>
						<Dialog className="outline-hidden" aria-label={title}>
							{children}
						</Dialog>
					</PopoverContent>
				</Popover>
			);
		case "unmatched":
			return (
				<Drawer isOpen={isOpen} onOpenChange={onOpenChange}>
					{trigger}
					<DrawerContent>
						<div className="flex flex-col gap-4 pt-2">
							<DrawerTitle>{title}</DrawerTitle>
							{children}
						</div>
					</DrawerContent>
				</Drawer>
			);
	}
};
