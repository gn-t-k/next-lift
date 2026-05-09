"use client";

import type { FC, PropsWithChildren } from "react";
import { cn } from "../../libs/utils";

type Props = PropsWithChildren<{
	className?: string;
	fadeFrom?: string;
}>;

export const ScrollArea: FC<Props> = ({
	children,
	className,
	fadeFrom = "from-overlay",
}) => (
	<div
		data-slot="scroll-area"
		className={cn("relative [timeline-scope:--scrollable]", className)}
	>
		<div className="overflow-x-auto [scroll-timeline-axis:inline] [scroll-timeline-name:--scrollable] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
			{children}
		</div>
		<div
			aria-hidden="true"
			className={cn(
				"pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r to-transparent opacity-0 [animation-fill-mode:both] [animation-name:scroll-fade-start] [animation-timeline:--scrollable]",
				fadeFrom,
			)}
		/>
		<div
			aria-hidden="true"
			className={cn(
				"pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l to-transparent opacity-0 [animation-fill-mode:both] [animation-name:scroll-fade-end] [animation-timeline:--scrollable]",
				fadeFrom,
			)}
		/>
	</div>
);
