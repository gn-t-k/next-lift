import type { FC } from "react";
import { tv } from "tailwind-variants";
import { cn } from "../lib";

const badge = tv({
	base: "inline-flex items-center rounded-full px-2.5 py-0.5 font-medium text-xs",
	variants: {
		status: {
			HIT: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
			MISS: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
			STALE:
				"bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
		},
	},
});

type Props = {
	status: keyof typeof badge.variants.status;
	timestamp?: string;
	className?: string;
};

export const StatusBadge: FC<Props> = ({ status, timestamp, className }) => {
	return (
		<div className={cn("flex items-center gap-2", className)}>
			<span className={badge({ status })}>{status}</span>
			{timestamp && (
				<span className="text-muted-fg text-xs">
					{new Date(timestamp).toLocaleTimeString("ja-JP")}
				</span>
			)}
		</div>
	);
};
