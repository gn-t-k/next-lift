import type { FC, PropsWithChildren, ReactNode } from "react";
import { Heading } from "../../primitives/heading";

type Props = PropsWithChildren<{
	title: ReactNode;
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
	<section className="flex min-h-[30rem] flex-col overflow-hidden bg-bg">
		<header className="flex min-h-10 items-start justify-between gap-3 px-0 py-1">
			<div className="flex min-w-0 flex-1 items-start gap-2">
				{leading !== undefined ? (
					<div className="shrink-0">{leading}</div>
				) : null}
				<div className="flex min-w-0 flex-1 flex-col gap-1">
					{typeof title === "string" ? <PanelTitle>{title}</PanelTitle> : title}
					{meta !== undefined ? <PanelMeta>{meta}</PanelMeta> : null}
				</div>
			</div>
			{actions !== undefined ? <div className="shrink-0">{actions}</div> : null}
		</header>
		<div className="flex min-h-0 flex-1 flex-col overflow-y-auto py-2">
			{children}
		</div>
	</section>
);

/** Error 等、Heading 以外で title スロットに渡す pass-through 用 */
export const DrilldownPlanPanelAlertTitle: FC<PropsWithChildren> = ({
	children,
}) => <PanelAlertTitle>{children}</PanelAlertTitle>;

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
