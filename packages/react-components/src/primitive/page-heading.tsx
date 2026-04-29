import type { FC, ReactNode } from "react";

type Props = {
	as: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
	children: ReactNode;
};

export const PageHeading: FC<Props> = ({ as: As, children }) => {
	return <As className="mb-4 font-semibold text-fg text-xl">{children}</As>;
};
