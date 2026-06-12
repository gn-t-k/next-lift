import type { FC, ReactNode } from "react";

type Props = {
	children: ReactNode;
};

export const MissingParentState: FC<Props> = ({ children }) => (
	<div className="flex min-h-full flex-1 items-center justify-center px-3 py-4 text-center text-muted-fg text-sm">
		{children}
	</div>
);
