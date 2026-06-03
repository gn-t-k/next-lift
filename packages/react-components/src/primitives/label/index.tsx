"use client";

import type { FC } from "react";
import {
	Label as LabelPrimitive,
	type LabelProps,
} from "react-aria-components";
import { cn } from "../../libs/utils";

export const Label: FC<LabelProps> = ({ className, ...props }) => (
	<LabelPrimitive
		data-slot="label"
		className={cn(
			"block select-none font-medium text-base/6 text-fg sm:text-sm/6",
			"in-data-[required=true]:after:ml-1.5 in-data-[required=true]:after:text-danger-subtle-fg in-data-[required=true]:after:content-['*']",
			"in-disabled:opacity-50",
			className,
		)}
		{...props}
	/>
);
