import type { FC, PropsWithChildren } from "react";
import { cn } from "../../libs";

type Props = {
	width?: "narrow" | "wide";
};

const widthClasses = {
	narrow: "max-w-2xl",
	wide: "max-w-screen-xl",
} satisfies Record<NonNullable<Props["width"]>, string>;

export const Main: FC<PropsWithChildren<Props>> = ({
	width = "narrow",
	children,
}) => {
	return (
		<main className={cn("mx-auto w-full p-4", widthClasses[width])}>
			{children}
		</main>
	);
};
