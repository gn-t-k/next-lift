"use client";

import type { FC } from "react";
import {
	ToggleButton as ToggleButtonPrimitive,
	type ToggleButtonProps,
} from "react-aria-components";
import { cx } from "../../libs/primitive";

export const ToggleButton: FC<ToggleButtonProps> = ({
	className,
	...props
}) => (
	<ToggleButtonPrimitive
		className={cx(
			"inline-flex min-h-9 min-w-9 cursor-default items-center justify-center rounded-md border border-border px-2.5 py-1.5 font-medium text-fg text-sm tabular-nums",
			"hover:enabled:bg-secondary",
			"selected:border-primary selected:bg-primary selected:text-primary-fg",
			"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
			"disabled:opacity-50",
			className,
		)}
		{...props}
	/>
);
