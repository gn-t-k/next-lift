"use client";

import type { FC, PropsWithChildren, ReactNode } from "react";
import { createContext, useContext } from "react";
import { cn } from "../../libs";

const HeadingContext = createContext(0);

const headings = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;

const headingStyles = {
	1: "font-semibold text-fg text-3xl",
	2: "font-semibold text-fg text-2xl",
	3: "font-medium text-fg text-xl",
	4: "font-medium text-fg text-lg",
	5: "font-medium text-fg text-base",
	6: "font-medium text-fg text-sm",
} as const;

// `<section>` 要素を出しつつ、配下の Heading の level を 1 段深くする境界。
// HTML5 outline algorithm の精神（section の中の h1 は h2 扱い）を React Context で再現する。
export const Section: FC<PropsWithChildren> = ({ children }) => {
	const level = useContext(HeadingContext);
	return (
		<HeadingContext.Provider value={Math.min(level + 1, 5)}>
			<section>{children}</section>
		</HeadingContext.Provider>
	);
};

type Props = {
	className?: string;
	children: ReactNode;
};

// 現在の HeadingContext の level に応じた h1〜h6 を出力する見出し。
// レベルは Section のネスト深度で決まる（Section 0個 = h1、1個 = h2、…、5個以上 = h6）。
// className を渡すと既定スタイルに上書き merge される。
export const Heading: FC<Props> = ({ className, children }) => {
	const level = useContext(HeadingContext);
	// Section 側で 0〜5 にクランプ済みだが、context API 経由なので TS の型は number。実行時の安全網としてここでも clamp する
	const idx = Math.min(Math.max(level, 0), 5) as 0 | 1 | 2 | 3 | 4 | 5;
	const As = headings[idx];
	const headingLevel = (idx + 1) as 1 | 2 | 3 | 4 | 5 | 6;
	return (
		<As className={cn(headingStyles[headingLevel], className)}>{children}</As>
	);
};
