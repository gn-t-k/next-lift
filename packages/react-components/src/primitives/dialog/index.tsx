"use client";

import type { ComponentProps, FC } from "react";
import {
	Dialog as DialogPrimitive,
	Heading as HeadingPrimitive,
	type HeadingProps,
} from "react-aria-components";
import { cn } from "../../libs";

type DialogProps = ComponentProps<typeof DialogPrimitive>;

export const Dialog: FC<DialogProps> = ({ className, ...props }) => (
	<DialogPrimitive className={cn("outline-hidden", className)} {...props} />
);

export const DialogTitle: FC<HeadingProps> = ({ className, ...props }) => (
	<HeadingPrimitive
		slot="title"
		className={cn("text-balance font-semibold text-base/6 text-fg", className)}
		{...props}
	/>
);
