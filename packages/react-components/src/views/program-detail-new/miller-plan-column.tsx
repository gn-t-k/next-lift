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
			<div className="flex min-w-0 flex-col gap-1">
				<ColumnLabel>{label}</ColumnLabel>
				{typeof title === "string" ? <ColumnTitle>{title}</ColumnTitle> : title}
				{meta !== undefined ? <ColumnMeta>{meta}</ColumnMeta> : null}
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

/** Error 等、Heading 以外で title スロットに渡す pass-through 用 */
export const MillerPlanColumnAlertTitle: FC<PropsWithChildren> = ({
	children,
}) => <ColumnAlertTitle>{children}</ColumnAlertTitle>;

const ColumnLabel: FC<PropsWithChildren> = ({ children }) => (
	<p className="font-medium text-muted-fg text-xs">{children}</p>
);

const ColumnTitle: FC<PropsWithChildren> = ({ children }) => (
	<Heading className="truncate font-medium text-base text-fg">
		{children}
	</Heading>
);

const ColumnAlertTitle: FC<PropsWithChildren> = ({ children }) => (
	<span role="alert" className="block truncate font-medium text-base text-fg">
		{children}
	</span>
);

const ColumnMeta: FC<PropsWithChildren> = ({ children }) => (
	<p className="line-clamp-2 shrink-0 whitespace-pre-wrap text-muted-fg text-xs">
		{children}
	</p>
);
