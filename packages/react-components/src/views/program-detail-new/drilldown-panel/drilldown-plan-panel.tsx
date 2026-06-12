import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import type { FC, PropsWithChildren, ReactNode } from "react";
import { cn } from "../../../libs";
import { Heading } from "../../../primitives/heading";
import { skeletonClass } from "../../../primitives/skeleton";
import { DayListLoading } from "../day-list";
import { ProgramInfoDialogButtonLoading } from "../program-info-dialog-button";

type Props = PropsWithChildren<{
	title: string | undefined;
	meta: ReactNode;
	leading: ReactNode;
	actions: ReactNode;
}>;

export const DrilldownPlanPanel: FC<Props> = ({
	title,
	meta,
	leading,
	actions,
	children,
}) => (
	<PanelShell
		title={title !== undefined ? <PanelTitle>{title}</PanelTitle> : null}
		meta={meta !== undefined ? <PanelMeta>{meta}</PanelMeta> : null}
		leading={leading}
		actions={actions}
	>
		{children}
	</PanelShell>
);

export const DrilldownPlanPanelLoading: FC = () => (
	<PanelShell
		title={
			<span aria-hidden className={cn(skeletonClass, "block h-7 w-2/3")} />
		}
		meta={
			<span aria-hidden className={cn(skeletonClass, "block h-3 w-full")} />
		}
		leading={undefined}
		actions={<ProgramInfoDialogButtonLoading />}
	>
		<DayListLoading />
	</PanelShell>
);

type DrilldownPlanPanelErrorProps = {
	message?: ReactNode;
};

export const DrilldownPlanPanelError: FC<DrilldownPlanPanelErrorProps> = ({
	message,
}) => {
	const description = message ?? "時間をおいて再読み込みしてください。";

	return (
		<PanelShell
			title={
				<PanelAlertTitle>プログラムを取得できませんでした</PanelAlertTitle>
			}
			meta={<PanelMeta>{description}</PanelMeta>}
			leading={undefined}
			actions={
				<ExclamationTriangleIcon
					aria-hidden
					className="mt-0.5 size-5 shrink-0 text-warning"
				/>
			}
		>
			<PanelIdleBody />
		</PanelShell>
	);
};

type PanelShellProps = PropsWithChildren<{
	title: ReactNode;
	meta: ReactNode;
	leading: ReactNode;
	actions: ReactNode;
}>;

const PanelShell: FC<PanelShellProps> = ({
	title,
	meta,
	leading,
	actions,
	children,
}) => (
	<section className="flex min-h-[30rem] flex-col overflow-hidden bg-bg">
		<header className="flex min-h-10 items-start justify-between gap-3 px-0 py-1">
			<div className="flex min-w-0 flex-1 items-start gap-2">
				{leading !== undefined ? (
					<div className="shrink-0">{leading}</div>
				) : null}
				<div className="flex min-w-0 flex-1 flex-col gap-1">
					{title}
					{meta}
				</div>
			</div>
			{actions !== undefined ? <div className="shrink-0">{actions}</div> : null}
		</header>
		<div className="flex min-h-0 flex-1 flex-col overflow-y-auto py-2">
			{children}
		</div>
	</section>
);

const PanelIdleBody: FC = () => <div aria-hidden className="min-h-24 flex-1" />;

const PanelTitle: FC<PropsWithChildren> = ({ children }) => (
	<Heading className="font-medium @min-[56rem]:text-base text-fg text-xl">
		{children}
	</Heading>
);

const PanelAlertTitle: FC<PropsWithChildren> = ({ children }) => (
	<span role="alert" className="block truncate font-medium text-fg text-xl">
		{children}
	</span>
);

const PanelMeta: FC<PropsWithChildren> = ({ children }) => (
	<p className="truncate text-muted-fg text-xs">{children}</p>
);
