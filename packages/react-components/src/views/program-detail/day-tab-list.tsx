import type { FC } from "react";
import { Link } from "../../primitives/link";
import { Tab, TabList, TabPanel, Tabs } from "../../primitives/tabs";

type Day = {
	id: string;
	label: string;
	detailHref: string;
};

type Props = {
	days: Day[];
	defaultSelectedDayId?: string;
};

export const DayTabList: FC<Props> = ({ days, defaultSelectedDayId }) => {
	const tabsProps =
		defaultSelectedDayId !== undefined
			? { defaultSelectedKey: defaultSelectedDayId }
			: {};
	return (
		<Tabs {...tabsProps}>
			<TabList aria-label="Day">
				{days.map((day) => (
					<Tab key={day.id} id={day.id}>
						{day.label}
					</Tab>
				))}
			</TabList>
			{days.map((day) => (
				<TabPanel key={day.id} id={day.id}>
					<div className="p-4">
						<Link
							href={day.detailHref}
							className="text-primary-subtle-fg text-sm underline-offset-2 hover:underline"
						>
							Day の詳細を編集 →
						</Link>
					</div>
				</TabPanel>
			))}
		</Tabs>
	);
};
