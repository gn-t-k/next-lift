import type { FC, PropsWithChildren, ReactNode } from "react";

type Props = PropsWithChildren<{
	index: number;
	display: ReactNode;
	menu?: ReactNode;
}>;

export const SetPlanRowFrame: FC<Props> = ({
	index,
	display,
	menu,
	children,
}) => (
	<div className="flex items-baseline gap-3 px-3 py-2 text-sm">
		<span className="w-8 shrink-0 text-muted-fg text-xs tabular-nums">
			{`#${index + 1}`}
		</span>
		<span className="flex-1 text-fg tabular-nums">{display}</span>
		{children}
		{menu}
	</div>
);
