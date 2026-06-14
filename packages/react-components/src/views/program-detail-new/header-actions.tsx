import type { FC, ReactNode } from "react";

type Props = {
	children: ReactNode;
};

export const HeaderActions: FC<Props> = ({ children }) => (
	<div className="flex shrink-0 items-center gap-1">{children}</div>
);
