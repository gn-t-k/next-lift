import type { ComponentProps, FC } from "react";
import { tv } from "tailwind-variants";
import { cn } from "../lib";

export const DemoCard: FC<ComponentProps<"div">> = ({
	children,
	className,
	...props
}) => {
	return (
		<div
			{...props}
			className={cn(
				className,
				"overflow-hidden rounded-lg border border-border bg-muted shadow-sm",
			)}
		>
			{children}
		</div>
	);
};

type DemoCardHeaderProps = ComponentProps<"div"> & {
	priority?: "A" | "B" | "C";
};
export const DemoCardHeader: FC<DemoCardHeaderProps> = ({
	priority,
	children,
	className,
	...props
}) => {
	const priorityBadge = tv({
		base: "inline-flex items-center rounded-full px-2.5 py-0.5 font-medium text-xs",
		variants: {
			priority: {
				A: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
				B: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
				C: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
			},
		},
	});

	return (
		<div
			{...props}
			className={cn(
				className,
				"flex items-start justify-between border-border border-b bg-accent px-6 py-4",
			)}
		>
			<div>{children}</div>
			{priority && (
				<span className={priorityBadge({ priority })}>
					{
						{
							A: "基礎",
							B: "実用",
							C: "高度",
						}[priority]
					}
				</span>
			)}
		</div>
	);
};

export const DemoCardTitle: FC<ComponentProps<"h3">> = ({
	children,
	className,
	...props
}) => {
	return (
		<h3 {...props} className={cn(className, "font-semibold text-fg text-lg")}>
			{children}
		</h3>
	);
};

export const DemoCardDescription: FC<ComponentProps<"p">> = ({
	children,
	className,
	...props
}) => {
	return (
		<p {...props} className={cn(className, "mt-1 text-muted-fg text-sm")}>
			{children}
		</p>
	);
};

export const DemoCardContent: FC<ComponentProps<"div">> = ({
	children,
	className,
	...props
}) => {
	return (
		<div {...props} className={cn(className, "p-6")}>
			{children}
		</div>
	);
};
