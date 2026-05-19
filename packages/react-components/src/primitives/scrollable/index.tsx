"use client";

import { type FC, type PropsWithChildren, useRef } from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { cn } from "../../libs/utils";
import { computeScrollLeft, type ScrollAlign } from "./compute-scroll-left";

type Props = PropsWithChildren<
	VariantProps<typeof fadeStyles> & {
		className?: string;
		scrollAlign?: ScrollAlign;
	}
>;

export const ScrollArea: FC<Props> = ({
	children,
	className,
	fadeFrom,
	scrollAlign = "nearest",
}) => {
	const initializedRef = useRef(false);

	const setContainer = (container: HTMLDivElement | null) => {
		if (!container || initializedRef.current) return;
		initializedRef.current = true;
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
	};

	return (
		<div
			data-slot="scroll-area"
			className={cn(
				"relative min-w-0 [timeline-scope:--scrollable]",
				className,
			)}
		>
			<div
				ref={setContainer}
				className="overflow-x-auto [scroll-timeline-axis:inline] [scroll-timeline-name:--scrollable] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
			>
				{children}
			</div>
			<div
				aria-hidden="true"
				className={cn(
					"pointer-events-none absolute inset-y-0 left-0 w-8 bg-linear-to-r to-transparent fill-mode-[both] opacity-0 [animation-name:scroll-fade-start] [animation-timeline:--scrollable]",
					fadeStyles({ fadeFrom }),
				)}
			/>
			<div
				aria-hidden="true"
				className={cn(
					"pointer-events-none absolute inset-y-0 right-0 w-8 bg-linear-to-l to-transparent fill-mode-[both] opacity-0 [animation-name:scroll-fade-end] [animation-timeline:--scrollable]",
					fadeStyles({ fadeFrom }),
				)}
			/>
		</div>
	);
};

// 親コンテナの背景色トークンに合わせる（フェードを背景に溶け込ませるため）
const fadeStyles = tv({
	variants: {
		fadeFrom: {
			bg: "from-bg",
			overlay: "from-overlay",
			navbar: "from-navbar",
			sidebar: "from-sidebar",
			secondary: "from-secondary",
		},
	},
	defaultVariants: {
		fadeFrom: "overlay",
	},
});
