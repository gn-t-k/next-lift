import type { FC, PropsWithChildren } from "react";
import { cn } from "../../lib";

type Props = {
	as?: "main" | "section";
	width?: "narrow" | "wide";
};

const widthClasses = {
	narrow: "max-w-2xl",
	wide: "max-w-screen-xl",
} satisfies Record<NonNullable<Props["width"]>, string>;

export const PageSection: FC<PropsWithChildren<Props>> = ({
	as: As = "main",
	width = "narrow",
	children,
}) => {
	return (
		<As className={cn("mx-auto w-full p-4", widthClasses[width])}>
			{children}
		</As>
	);
};
