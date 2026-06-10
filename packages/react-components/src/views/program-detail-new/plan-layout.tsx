import type { FC, ReactNode } from "react";
import { cn } from "../../libs";
import { Heading } from "../../primitives/heading";

type LabeledPlanColumnProps = {
	label: string;
	title?: ReactNode | undefined;
	meta?: ReactNode | undefined;
	actions?: ReactNode | undefined;
	children: ReactNode;
};

export const LabeledPlanColumn: FC<LabeledPlanColumnProps> = ({
	label,
	title,
	meta,
	actions,
	children,
}) => (
	<div className="flex h-full min-h-0 flex-col gap-2">
		<div className="flex h-20 items-start justify-between gap-3 px-1">
			<div className="min-w-0">
				<p className="font-medium text-muted-fg text-xs">{label}</p>
				{renderLabeledPlanColumnTitle(title)}
				{meta !== undefined ? (
					<p className="mt-1 line-clamp-2 shrink-0 whitespace-pre-wrap text-muted-fg text-xs">
						{meta}
					</p>
				) : null}
			</div>
			{actions !== undefined ? <div className="shrink-0">{actions}</div> : null}
		</div>
		<div className="min-h-0 flex-1">{children}</div>
	</div>
);

const renderLabeledPlanColumnTitle = (
	title: ReactNode | undefined,
): ReactNode | undefined => {
	if (title === undefined) {
		return undefined;
	}
	if (typeof title !== "string") {
		return title;
	}
	return (
		<Heading className="mt-0.5 truncate font-medium text-base text-fg">
			{title}
		</Heading>
	);
};

type PlanColumnProps = {
	title?: ReactNode | undefined;
	meta?: ReactNode | undefined;
	leading?: ReactNode | undefined;
	actions?: ReactNode | undefined;
	className?: string | undefined;
	variant?: "framed" | "plain" | undefined;
	children: ReactNode;
};

export const PlanColumn: FC<PlanColumnProps> = ({
	title,
	meta,
	leading,
	actions,
	className,
	variant = "framed",
	children,
}) => {
	const isPlain = variant === "plain";
	const shouldShowHeader =
		title !== undefined ||
		meta !== undefined ||
		leading !== undefined ||
		actions !== undefined;
	const renderedTitle = renderPlanColumnTitle(title);

	return (
		<section
			className={cn(
				"flex min-h-0 flex-col overflow-hidden bg-bg",
				isPlain ? undefined : "rounded-lg border border-border",
				isPlain ? undefined : "h-full",
				className,
			)}
		>
			{shouldShowHeader ? (
				<header
					className={cn(
						"flex items-start justify-between gap-3",
						isPlain
							? "min-h-10 px-0 py-1"
							: "min-h-14 border-border border-b px-3 py-2",
					)}
				>
					<div className="flex min-w-0 flex-1 items-start gap-2">
						{leading !== undefined ? (
							<div className="shrink-0">{leading}</div>
						) : null}
						<div className="min-w-0 flex-1">
							{title !== undefined ? renderedTitle : null}
							{meta !== undefined ? (
								<p className="mt-1 truncate text-muted-fg text-xs">{meta}</p>
							) : null}
						</div>
					</div>
					{actions !== undefined ? (
						<div className="shrink-0">{actions}</div>
					) : null}
				</header>
			) : null}
			<div
				className={cn(
					"flex min-h-0 flex-1 flex-col overflow-y-auto",
					isPlain ? "py-2" : "p-2",
				)}
			>
				{children}
			</div>
		</section>
	);
};

const renderPlanColumnTitle = (
	title: ReactNode | undefined,
): ReactNode | undefined => {
	if (title === undefined) {
		return undefined;
	}
	if (typeof title !== "string") {
		return title;
	}
	return (
		<Heading className="font-medium @min-[56rem]:text-base text-fg text-xl">
			{title}
		</Heading>
	);
};
