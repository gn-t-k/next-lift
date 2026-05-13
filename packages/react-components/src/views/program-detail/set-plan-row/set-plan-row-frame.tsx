import type { FC, PropsWithChildren } from "react";

type Props = PropsWithChildren<{
	index: number;
}>;

export const SetPlanRowFrame: FC<Props> = ({ index, children }) => (
	<div className="flex items-baseline gap-3 px-3 py-2 text-sm">
		<span className="w-8 shrink-0 text-muted-fg text-xs tabular-nums">
			{`#${index + 1}`}
		</span>
		{children}
	</div>
);
