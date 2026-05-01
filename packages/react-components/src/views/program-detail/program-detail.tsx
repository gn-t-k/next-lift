import type { FC } from "react";
import {
	Tab,
	TabList,
	TabPanel,
	TabScrollArea,
	Tabs,
} from "../../primitives/tabs";
import { CreateDayCard } from "./create-day-card";

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
	onAddDay: () => void;
};

export const ProgramDetail: FC<Props> = ({
	name,
	meta,
	days,
	defaultSelectedDayId,
	onAddDay,
}) => {
	const tabsProps =
		defaultSelectedDayId !== undefined
			? { defaultSelectedKey: defaultSelectedDayId }
			: {};
	return (
		<div className="flex flex-col gap-6">
			<header className="flex flex-col gap-2">
				<h1 className="font-semibold text-2xl text-fg">{name}</h1>
				{meta !== null && meta !== "" && (
					<p className="whitespace-pre-wrap text-muted-fg text-sm">{meta}</p>
				)}
			</header>
			{days.length === 0 ? (
				<CreateDayCard onAddDay={onAddDay} />
			) : (
				<Tabs {...tabsProps}>
					<TabScrollArea>
						<TabList aria-label="Day">
							{days.map((day) => (
								<Tab key={day.id} id={day.id}>
									{day.label}
								</Tab>
							))}
						</TabList>
					</TabScrollArea>
					{days.map((day) => (
						// Day の中身 (種目計画等) は別タスクで実装予定のため、骨格段階では空
						<TabPanel key={day.id} id={day.id} />
					))}
				</Tabs>
			)}
		</div>
	);
};
