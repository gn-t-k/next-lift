import type { FC, PropsWithChildren } from "react";
import { cn } from "../../libs/utils";

type Props = {
	className?: string;
};

export const GymContext: FC<PropsWithChildren<Props>> = ({
	children,
	className,
}) => <div className={cn("context-gym", className)}>{children}</div>;
