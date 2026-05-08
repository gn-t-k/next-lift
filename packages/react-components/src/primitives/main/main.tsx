"use client";

import type { FC, PropsWithChildren } from "react";
import { cn } from "../../libs";
import { HeadingContext } from "../heading/heading";

type Props = {
	width?: "narrow" | "wide";
};

const widthClasses = {
	narrow: "max-w-2xl",
	wide: "max-w-screen-xl",
} satisfies Record<NonNullable<Props["width"]>, string>;

// Main は HTML5 sectioning root（`<main>`）として、配下の Heading の初期レベル（h1）を確立する。
// 配下に Section をネストすると h2、h3 と段階的に深くなる。
export const Main: FC<PropsWithChildren<Props>> = ({
	width = "narrow",
	children,
}) => {
	return (
		<HeadingContext value={1}>
			<main className={cn("mx-auto w-full p-4", widthClasses[width])}>
				{children}
			</main>
		</HeadingContext>
	);
};
