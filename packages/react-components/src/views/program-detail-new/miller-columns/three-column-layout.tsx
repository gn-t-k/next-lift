import type { FC, PropsWithChildren } from "react";

export const ThreeColumnLayout: FC<PropsWithChildren> = ({ children }) => (
	<div className="grid h-[32rem] grid-cols-[minmax(13rem,0.9fr)_minmax(17rem,1fr)_minmax(20rem,1.25fr)] items-stretch gap-3">
		{children}
	</div>
);
