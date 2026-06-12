import type { FC, PropsWithChildren, ReactNode } from "react";
import { Heading } from "../../primitives/heading";

type Props = PropsWithChildren<{
	label: string;
	title: ReactNode;
	meta: ReactNode;
	actions: ReactNode;
}>;

export const MillerPlanColumn: FC<Props> = ({
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
				{typeof title === "string" ? (
					<Heading className="mt-0.5 truncate font-medium text-base text-fg">
						{title}
					</Heading>
				) : (
					title
				)}
				{meta !== undefined ? (
					<p className="mt-1 line-clamp-2 shrink-0 whitespace-pre-wrap text-muted-fg text-xs">
						{meta}
					</p>
				) : null}
			</div>
			{actions !== undefined ? <div className="shrink-0">{actions}</div> : null}
		</div>
		<section className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-border bg-bg">
			<div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-2">
				{children}
			</div>
		</section>
	</div>
);
