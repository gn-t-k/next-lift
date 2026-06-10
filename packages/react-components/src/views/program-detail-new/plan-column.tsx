import type { FC, ReactNode } from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { cn } from "../../libs";
import { Heading } from "../../primitives/heading";

type Props = VariantProps<typeof planColumnStyles> & {
	title?: ReactNode | undefined;
	meta?: ReactNode | undefined;
	leading?: ReactNode | undefined;
	actions?: ReactNode | undefined;
	className?: string | undefined;
	children: ReactNode;
};

export const PlanColumn: FC<Props> = ({
	title,
	meta,
	leading,
	actions,
	className,
	variant,
	children,
}) => {
	const styles = planColumnStyles({ variant });
	const shouldShowHeader =
		title !== undefined ||
		meta !== undefined ||
		leading !== undefined ||
		actions !== undefined;
	const renderedTitle = renderTitle(title);

	return (
		<section className={cn(styles.root(), className)}>
			{shouldShowHeader ? (
				<header className={styles.header()}>
					<div className="flex min-w-0 flex-1 items-start gap-2">
						{leading !== undefined ? (
							<div className="shrink-0">{leading}</div>
						) : null}
						<div className="min-w-0 flex-1">
							{renderedTitle}
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
			<div className={styles.body()}>{children}</div>
		</section>
	);
};

const renderTitle = (title: ReactNode | undefined): ReactNode | undefined => {
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

const planColumnStyles = tv({
	slots: {
		root: "flex min-h-0 flex-col overflow-hidden bg-bg",
		header: "flex items-start justify-between gap-3",
		body: "flex min-h-0 flex-1 flex-col overflow-y-auto",
	},
	variants: {
		variant: {
			framed: {
				root: "h-full rounded-lg border border-border",
				header: "min-h-14 border-border border-b px-3 py-2",
				body: "p-2",
			},
			plain: {
				header: "min-h-10 px-0 py-1",
				body: "py-2",
			},
		},
	},
	defaultVariants: {
		variant: "framed",
	},
});
