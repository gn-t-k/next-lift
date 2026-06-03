"use client";

import type { FC } from "react";
import {
	TextArea as TextAreaPrimitive,
	type TextAreaProps,
} from "react-aria-components";
import { cx } from "../../libs/primitive";

export const TextArea: FC<TextAreaProps> = ({ className, ...props }) => (
	<TextAreaPrimitive
		data-slot="control"
		className={cx(
			"block min-h-24 w-full resize-y rounded-lg border border-border bg-overlay px-3 py-2 text-base/6 text-fg outline-none",
			"placeholder:text-muted-fg",
			"focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
			"invalid:border-danger",
			"disabled:opacity-50",
			"sm:text-sm/6",
			className,
		)}
		{...props}
	/>
);
