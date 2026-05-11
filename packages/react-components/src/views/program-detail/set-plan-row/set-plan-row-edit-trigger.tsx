"use client";

import type { FC, PropsWithChildren } from "react";
import { SetPlanRowDrawer } from "./set-plan-row-drawer";
import { SetPlanRowPopover } from "./set-plan-row-popover";
import { useIsMdUp } from "./use-is-md-up";

type Props = PropsWithChildren<{
	title: string;
	isOpen: boolean;
	onOpenChange: (isOpen: boolean) => void;
	onStart: () => void;
}>;

export const SetPlanRowEditTrigger: FC<Props> = ({
	title,
	isOpen,
	onOpenChange,
	onStart,
	children,
}) => {
	const isMdUp = useIsMdUp();
	const Trigger = isMdUp ? SetPlanRowPopover : SetPlanRowDrawer;
	return (
		<Trigger
			title={title}
			isOpen={isOpen}
			onOpenChange={onOpenChange}
			onStart={onStart}
		>
			{children}
		</Trigger>
	);
};
