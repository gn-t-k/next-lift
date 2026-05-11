"use client";

import type { FC, PropsWithChildren, ReactNode } from "react";
import { createContext, use } from "react";
import { cn } from "../../libs";

const Uninitialized = Symbol("Uninitialized");
type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export const HeadingContext = createContext<
	HeadingLevel | typeof Uninitialized
>(Uninitialized);

type SectionProps = PropsWithChildren<{
	className?: string;
}>;

export const Section: FC<SectionProps> = ({ className, children }) => {
	const level = (() => {
		const context = use(HeadingContext);
		switch (context) {
			case Uninitialized:
				return 1;
			case 1:
				return 2;
			case 2:
				return 3;
			case 3:
				return 4;
			case 4:
				return 5;
			case 5:
				return 6;
			case 6:
				return 6;
		}
	})();

	return (
		<HeadingContext value={level}>
			<section className={className}>{children}</section>
		</HeadingContext>
	);
};

type Props = {
	className?: string;
	children: ReactNode;
};

export const Heading: FC<Props> = ({ className, children }) => {
	const level = use(HeadingContext);
	if (level === Uninitialized) {
		throw new Error(
			"Heading コンポーネントは Main または Section の配下で使用してください",
		);
	}
	switch (level) {
		case 1:
			return (
				<h1 className={cn("font-semibold text-3xl text-fg", className)}>
					{children}
				</h1>
			);
		case 2:
			return (
				<h2 className={cn("font-semibold text-2xl text-fg", className)}>
					{children}
				</h2>
			);
		case 3:
			return (
				<h3 className={cn("font-medium text-fg text-xl", className)}>
					{children}
				</h3>
			);
		case 4:
			return (
				<h4 className={cn("font-medium text-fg text-lg", className)}>
					{children}
				</h4>
			);
		case 5:
			return (
				<h5 className={cn("font-medium text-base text-fg", className)}>
					{children}
				</h5>
			);
		case 6:
			return (
				<h6 className={cn("font-medium text-fg text-sm", className)}>
					{children}
				</h6>
			);
	}
};
