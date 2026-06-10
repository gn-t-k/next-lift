import type { FC, ReactNode } from "react";
import { Heading } from "../../primitives/heading";

type Props = {
	label: string;
	title?: ReactNode | undefined;
	meta?: ReactNode | undefined;
	actions?: ReactNode | undefined;
	children: ReactNode;
};

export const LabeledPlanColumn: FC<Props> = ({
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
				{renderTitle(title)}
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

const renderTitle = (title: ReactNode | undefined): ReactNode | undefined => {
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
