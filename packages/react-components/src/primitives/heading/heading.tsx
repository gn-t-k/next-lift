"use client";

import type { FC, PropsWithChildren, ReactNode } from "react";
import { createContext, useContext } from "react";

const HeadingContext = createContext(0);

const headings = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;

export const HeadingLevel: FC<PropsWithChildren> = ({ children }) => {
	const level = useContext(HeadingContext);
	return (
		<HeadingContext.Provider value={Math.min(level + 1, 6)}>
			{children}
		</HeadingContext.Provider>
	);
};

type Props = {
	className?: string;
	children: ReactNode;
};

export const Heading: FC<Props> = ({ className, children }) => {
	const level = useContext(HeadingContext);
	const As = headings[Math.max(level, 1) - 1] ?? "h1";
	return <As className={className}>{children}</As>;
};
