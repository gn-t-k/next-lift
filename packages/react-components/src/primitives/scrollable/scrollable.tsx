"use client";

import { type FC, type PropsWithChildren, useEffect, useRef } from "react";
import { cn } from "../../libs/utils";
import { computeScrollLeft, type ScrollAlign } from "./compute-scroll-left";

type Props = PropsWithChildren<{
	className?: string;
	fadeFrom?: string;
	scrollAlign?: ScrollAlign;
}>;

export const ScrollArea: FC<Props> = ({
	children,
	className,
	fadeFrom = "from-overlay",
	scrollAlign = "nearest",
}) => {
	const scrollRef = useRef<HTMLDivElement>(null);

	// biome-ignore lint/correctness/useExhaustiveDependencies: 初期表示時のみ scrollLeft を設定する。マウント後の prop 変化には反応しない（uncontrolled の慣習）
	useEffect(() => {
		const container = scrollRef.current;
		if (!container) return;
		const target = container.querySelector<HTMLElement>(
			"[data-initial-scroll]",
		);
		if (!target) return;
		const containerRect = container.getBoundingClientRect();
		const targetRect = target.getBoundingClientRect();
		container.scrollLeft = computeScrollLeft(
			{
				containerWidth: container.clientWidth,
				containerScrollLeft: container.scrollLeft,
				targetLeft: targetRect.left - containerRect.left + container.scrollLeft,
				targetWidth: targetRect.width,
			},
			scrollAlign,
		);
	}, []);

	return (
		<div
			data-slot="scroll-area"
			className={cn("relative [timeline-scope:--scrollable]", className)}
		>
			<div
				ref={scrollRef}
				className="overflow-x-auto [scroll-timeline-axis:inline] [scroll-timeline-name:--scrollable] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
			>
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
};
