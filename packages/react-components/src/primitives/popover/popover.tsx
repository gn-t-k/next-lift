"use client";

import type { FC } from "react";
import {
	DialogTrigger as DialogTriggerPrimitive,
	Popover as PopoverPrimitive,
	type PopoverProps as PopoverPrimitiveProps,
} from "react-aria-components";
import { cn } from "../../libs/utils";

export const Popover = DialogTriggerPrimitive;

type PopoverContentProps = Omit<PopoverPrimitiveProps, "className"> & {
	className?: string;
};

export const PopoverContent: FC<PopoverContentProps> = ({
	className,
	...props
}) => (
	<PopoverPrimitive
		className={cn(
			"rounded-lg border border-border bg-overlay text-overlay-fg shadow-lg outline-hidden",
			"entering:fade-in entering:animate-in entering:duration-150",
			"exiting:fade-out exiting:animate-out exiting:duration-100",
			className,
		)}
		{...props}
	/>
);
