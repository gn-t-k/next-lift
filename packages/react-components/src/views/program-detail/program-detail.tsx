import type { FC } from "react";
import { DayTabList } from "./day-tab-list";

type Day = {
	id: string;
	label: string;
	detailHref: string;
};

type Props = {
	name: string;
	meta: string | null;
	days: Day[];
	defaultSelectedDayId?: string;
};

export const ProgramDetail: FC<Props> = ({
	name,
	meta,
	days,
	defaultSelectedDayId,
}) => {
	const dayTabListProps =
		defaultSelectedDayId !== undefined ? { defaultSelectedDayId } : {};
	return (
		<div className="flex flex-col gap-6">
			<header className="flex flex-col gap-2">
				<h2 className="min-h-[1lh] font-semibold text-2xl text-fg">{name}</h2>
				{meta !== null && meta !== "" && (
					<p className="whitespace-pre-wrap text-muted-fg text-sm">{meta}</p>
				)}
			</header>
			<DayTabList days={days} {...dayTabListProps} />
		</div>
	);
};
