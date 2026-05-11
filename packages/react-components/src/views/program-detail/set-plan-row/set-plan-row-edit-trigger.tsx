"use client";

import type { FC, PropsWithChildren } from "react";
import { SetPlanRowDrawer } from "./set-plan-row-drawer";
import { SetPlanRowPopover } from "./set-plan-row-popover";

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
}) => (
	<>
		<div className="md:hidden">
			<SetPlanRowDrawer
				title={title}
				isOpen={isOpen}
				onOpenChange={onOpenChange}
				onStart={onStart}
			>
				{children}
			</SetPlanRowDrawer>
		</div>
		<div className="hidden md:block">
			<SetPlanRowPopover
				title={title}
				isOpen={isOpen}
				onOpenChange={onOpenChange}
				onStart={onStart}
			>
				{children}
			</SetPlanRowPopover>
		</div>
	</>
);
