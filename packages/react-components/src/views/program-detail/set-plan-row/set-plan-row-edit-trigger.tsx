"use client";

import { PencilSquareIcon } from "@heroicons/react/24/outline";
import type { FC, PropsWithChildren } from "react";
import { useMediaQuery } from "../../../libs";
import { Button } from "../../../primitives/button";
import { SetPlanRowDrawer } from "./set-plan-row-drawer";
import { SetPlanRowPopover } from "./set-plan-row-popover";

const MD_BREAKPOINT = "(min-width: 768px)";

type Props = PropsWithChildren<{
	title: string;
}>;

export const SetPlanRowEditTrigger: FC<Props> = ({ title, children }) => {
	const isMdUp = useMediaQuery(MD_BREAKPOINT);
	if (isMdUp === null) {
		return (
			<Button
				intent="plain"
				size="sq-xs"
				isDisabled
				aria-label={`${title}を編集`}
			>
				<PencilSquareIcon data-slot="icon" className="size-4" aria-hidden />
			</Button>
		);
	}
	const Trigger = isMdUp ? SetPlanRowPopover : SetPlanRowDrawer;
	return <Trigger title={title}>{children}</Trigger>;
};
