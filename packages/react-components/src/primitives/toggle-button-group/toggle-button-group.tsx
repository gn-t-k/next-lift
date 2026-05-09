"use client";

import type { FC } from "react";
import {
	ToggleButton as ToggleButtonPrimitive,
	type ToggleButtonProps,
	ToggleButtonGroup as ToggleButtonGroupPrimitive,
	type ToggleButtonGroupProps,
} from "react-aria-components";
import { cx } from "../../libs/primitive";

export const ToggleButtonGroup: FC<ToggleButtonGroupProps> = ({
	className,
	...props
}) => (
	<ToggleButtonGroupPrimitive
		className={cx("flex flex-wrap gap-1", className)}
		{...props}
	/>
);

export const ToggleButton: FC<ToggleButtonProps> = ({ className, ...props }) => (
	<ToggleButtonPrimitive
		className={cx(
			"inline-flex min-h-9 min-w-9 cursor-default items-center justify-center rounded-md border border-border px-2.5 py-1.5 text-sm font-medium tabular-nums text-fg",
			"hover:enabled:bg-secondary",
			"selected:border-primary selected:bg-primary selected:text-primary-fg",
			"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
			"disabled:opacity-50",
			className,
		)}
		{...props}
	/>
);
