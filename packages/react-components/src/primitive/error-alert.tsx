"use client";

import type { FC, ReactNode } from "react";
import { cn } from "../lib";

type Props = {
	children: ReactNode;
	className?: string;
};

export const ErrorAlert: FC<Props> = ({ children, className }) => {
	return (
		<div
			role="alert"
			className={cn(
				className,
				"relative rounded-lg border border-danger bg-danger/10 p-4 text-danger-subtle-fg",
			)}
		>
			{children}
		</div>
	);
};
