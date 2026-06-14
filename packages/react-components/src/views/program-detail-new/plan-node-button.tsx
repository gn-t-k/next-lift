"use client";

import { ChevronRightIcon } from "@heroicons/react/24/outline";
import type { FC } from "react";
import { tv } from "tailwind-variants";
import { cn } from "../../libs";
import { skeletonClass } from "../../primitives/skeleton";

type Props = {
	label: string;
	meta: string;
	isSelected: boolean;
	onSelect: () => void;
};

export const PlanNodeButton: FC<Props> = ({
	label,
	meta,
	isSelected,
	onSelect,
}) => {
	const styles = planNodeButtonStyles({ selected: isSelected });

	return (
		<button
			type="button"
			onClick={onSelect}
			className={styles.button()}
			{...(isSelected ? selectedAriaCurrentProps : {})}
		>
			<span className="min-w-0 flex-1">
				<span className="block truncate font-medium">{label}</span>
				<span className={styles.meta()}>{meta}</span>
			</span>
			<ChevronRightIcon
				data-slot="icon"
				className="size-4 text-muted-fg"
				aria-hidden
			/>
		</button>
	);
};

const planNodeButtonStyles = tv({
	slots: {
		button:
			"flex h-12 w-full min-w-0 cursor-pointer appearance-none items-center justify-start gap-2 overflow-hidden rounded-lg border bg-transparent px-3 py-2 text-left font-normal text-sm/5 sm:h-12",
		meta: "mt-0.5 block text-xs",
	},
	variants: {
		selected: {
			true: {
				button:
					"border-primary-subtle-fg/30 bg-primary-subtle text-primary-subtle-fg hover:bg-primary-subtle hover:text-primary-subtle-fg",
				meta: "text-primary-subtle-fg",
			},
			false: {
				button: "border-transparent text-fg hover:bg-secondary hover:text-fg",
				meta: "text-muted-fg",
			},
		},
	},
});

const selectedAriaCurrentProps = {
	"aria-current": "true",
} satisfies { "aria-current": "true" };

export const PlanNodeButtonSkeleton: FC = () => {
	const styles = planNodeButtonStyles({ selected: false });

	return (
		<div aria-hidden className={cn(styles.button(), "pointer-events-none")}>
			<span className="min-w-0 flex-1">
				<span className={cn(skeletonClass, "block h-5 w-3/4")} />
				<span className={cn(skeletonClass, "mt-2 block h-3 w-16")} />
			</span>
			<ChevronRightIcon
				data-slot="icon"
				className="size-4 shrink-0 text-muted-fg/45"
				aria-hidden
			/>
		</div>
	);
};
