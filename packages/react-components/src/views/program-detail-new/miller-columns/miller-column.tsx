import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import type { FC, PropsWithChildren, ReactNode } from "react";
import { cn } from "../../../libs";
import { Heading } from "../../../primitives/heading";
import { skeletonClass } from "../../../primitives/skeleton";
import { DayListLoading } from "../day-list";
import { ProgramInfoDialogButtonLoading } from "../program-info-dialog-button";

type Props = PropsWithChildren<{
	label: string;
	title: string | undefined;
	meta: ReactNode;
	actions: ReactNode;
}>;

export const MillerColumn: FC<Props> = ({
	label,
	title,
	meta,
	actions,
	children,
}) => (
	<ColumnShell
		label={label}
		title={title !== undefined ? <ColumnTitle>{title}</ColumnTitle> : null}
		meta={meta !== undefined ? <ColumnMeta>{meta}</ColumnMeta> : null}
		actions={actions}
	>
		{children}
	</ColumnShell>
);

export const MillerColumnLoading: FC = () => (
	<ColumnShell
		label="プログラム"
		title={<span aria-hidden className={cn(skeletonClass, "block h-5 w-28")} />}
		meta={<span aria-hidden className={cn(skeletonClass, "block h-3 w-56")} />}
		actions={<ProgramInfoDialogButtonLoading />}
	>
		<DayListLoading />
	</ColumnShell>
);

type MillerColumnErrorProps = {
	message?: ReactNode;
};

export const MillerColumnError: FC<MillerColumnErrorProps> = ({
	message,
}) => {
	const description = message ?? "時間をおいて再読み込みしてください。";

	return (
		<ColumnShell
			label="プログラム"
			title={
				<ColumnAlertTitle>プログラムを取得できませんでした</ColumnAlertTitle>
			}
			meta={<ColumnMeta>{description}</ColumnMeta>}
			actions={
				<ExclamationTriangleIcon
					aria-hidden
					className="mt-0.5 size-5 shrink-0 text-warning"
				/>
			}
		>
			<ColumnIdleBody />
		</ColumnShell>
	);
};

type MillerColumnEmptyProps = {
	label: string;
};

export const MillerColumnEmpty: FC<MillerColumnEmptyProps> = ({
	label,
}) => (
	<ColumnShell label={label} title={null} meta={null} actions={undefined}>
		<ColumnIdleBody />
	</ColumnShell>
);

type ColumnShellProps = PropsWithChildren<{
	label: string;
	title: ReactNode;
	meta: ReactNode;
	actions: ReactNode;
}>;

const ColumnShell: FC<ColumnShellProps> = ({
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
				{title}
				{meta}
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

const ColumnIdleBody: FC = () => (
	<div aria-hidden className="min-h-24 flex-1" />
);

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
