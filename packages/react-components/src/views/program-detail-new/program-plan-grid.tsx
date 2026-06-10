import type { FC, ReactNode } from "react";

type Props = {
	children: ReactNode;
};

export const ProgramPlanGrid: FC<Props> = ({ children }) => (
	<div className="@min-[56rem]:grid hidden h-[32rem] grid-cols-[minmax(13rem,0.9fr)_minmax(17rem,1fr)_minmax(20rem,1.25fr)] items-stretch gap-3">
		{children}
	</div>
);
