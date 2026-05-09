"use client";

import type { FC } from "react";
import {
	composeRenderProps,
	ToggleButton as ToggleButtonPrimitive,
	type ToggleButtonProps,
} from "react-aria-components";
import { twMerge } from "tailwind-merge";
import { buttonStyles } from "../button/button";

export const ToggleButton: FC<ToggleButtonProps> = ({
	className,
	...props
}) => (
	<ToggleButtonPrimitive
		{...props}
		className={composeRenderProps(className, (cls, { isSelected }) =>
			twMerge(
				buttonStyles({
					intent: isSelected ? "primary" : "outline",
					size: "sm",
				}),
				cls,
			),
		)}
	/>
);
