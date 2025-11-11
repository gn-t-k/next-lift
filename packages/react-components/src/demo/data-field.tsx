import type { ComponentProps, FC } from "react";
import { cn } from "../lib/utils";

export const DataFieldList: FC<ComponentProps<"dl">> = ({
	children,
	className,
	...props
}) => {
	return (
		<dl {...props} className={cn("space-y-3", className)}>
			{children}
		</dl>
	);
};

export const DataFieldLabel: FC<ComponentProps<"dt">> = ({
	children,
	className,
	...props
}) => {
	return (
		<dt {...props} className={cn("font-medium text-fg text-sm", className)}>
			{children}
		</dt>
	);
};

export const DataFieldValue: FC<ComponentProps<"dd">> = ({
	children,
	className,
	...props
}) => {
	return (
		<dd {...props} className={className ?? "text-muted-fg"}>
			{children}
		</dd>
	);
};
