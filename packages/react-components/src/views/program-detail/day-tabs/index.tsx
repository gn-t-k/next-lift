"use client";

import { PlusIcon } from "@heroicons/react/24/solid";
import type { FC } from "react";
import { useMediaQuery } from "../../../libs";
import { Button } from "../../../primitives/button";
import { ScrollArea } from "../../../primitives/scrollable";
import { Tab, TabList } from "../../../primitives/tabs";
import { DayTabLabel } from "./day-tab-label";

type Day = {
	id: string;
	label: string;
};

type Props = {
	days: Day[];
	onAddDay: () => void;
	onChangeDayLabel: (dayId: string, label: string) => void;
	onDeleteDay: (dayId: string) => void;
};

export const DayTabs: FC<Props> = ({
	days,
	onAddDay,
	onChangeDayLabel,
	onDeleteDay,
}) => {
	const desktopViewport = useMediaQuery("(min-width: 768px)");

	return (
		<div className="flex items-end gap-2 border-border border-b">
			<ScrollArea className="flex-1">
				<TabList aria-label="Day" className="border-b-0">
					{days.map((day) => (
						<Tab
							key={day.id}
							id={day.id}
							aria-label={day.label}
							className="gap-x-1.5 pr-1.5"
						>
							<DayTabLabel
								dayId={day.id}
								label={day.label}
								onChange={onChangeDayLabel}
								onDelete={onDeleteDay}
								desktopViewport={desktopViewport}
							/>
						</Tab>
					))}
				</TabList>
			</ScrollArea>
			<Button
				intent="plain"
				size="sq-xs"
				aria-label="Day を追加"
				onPress={onAddDay}
				className="-mb-px shrink-0"
			>
				<PlusIcon data-slot="icon" className="size-4" aria-hidden />
			</Button>
		</div>
	);
};
