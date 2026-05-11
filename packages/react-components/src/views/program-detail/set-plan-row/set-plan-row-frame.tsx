import type { FC, PropsWithChildren } from "react";
import { cn } from "../../../libs/utils";

type Props = PropsWithChildren<{
	index: number;
	display: string;
	tone?: "default" | "muted";
}>;

export const SetPlanRowFrame: FC<Props> = ({
	index,
	display,
	tone = "default",
	children,
}) => (
	<div className="flex items-baseline gap-3 px-3 py-2 text-sm">
		<span className="w-8 shrink-0 text-muted-fg text-xs tabular-nums">
			{`#${index + 1}`}
		</span>
		<span
			className={cn(
				"flex-1 tabular-nums",
				tone === "muted" ? "text-muted-fg" : "text-fg",
			)}
		>
			{display}
		</span>
		{children}
	</div>
);
