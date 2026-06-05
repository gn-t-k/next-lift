"use client";

import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { type FC, type Key, type ReactNode, useCallback } from "react";
import { cn } from "../../libs/utils";
import { Section } from "../../primitives/heading";
import { skeletonClass } from "../../primitives/skeleton";
import { TabPanel, Tabs } from "../../primitives/tabs";
import { CreateDayCard } from "./create-day-card";
import { DayTabs } from "./day-tabs";
import { ProgramInfo } from "./program-info";
import { useDayTabSelection } from "./use-day-tab-selection";

type Props = {
	program: Program;
	programActions: ProgramActions;
	days: Day[];
	dayActions: DayActions;
	selection?: Selection;
	children: (day: Day) => ReactNode;
};

type Program = {
	name: string;
	meta: string | null;
};

type ProgramActions = {
	onChange: (payload: Program) => void;
	onDuplicate: () => void;
	onDelete: () => void;
};

type Day = {
	id: string;
	label: string;
};

type DayActions = {
	onAdd: () => void;
	onDelete: (dayId: string) => void;
	onChangeLabel: (dayId: string, label: string) => void;
};

type Selection = {
	defaultSelectedDayId?: string;
	lastAddedDayId?: string;
};

export const ProgramDetail: FC<Props> = ({
	program,
	programActions,
	days,
	dayActions,
	selection,
	children,
}) => {
	const dayIds = days.map((day) => day.id);
	const firstDayId = dayIds[0];
	const [selectedDayId, selectDay] = useDayTabSelection({
		dayIds,
		defaultSelectedDayId: selection?.defaultSelectedDayId,
		lastAddedDayId: selection?.lastAddedDayId,
	});
	const handleChangeSelection = useCallback(
		(key: Key) => {
			selectDay(String(key));
		},
		[selectDay],
	);
	const selectedDay = days.find((day) => day.id === selectedDayId);
	const selectedKey = selectedDay?.id ?? firstDayId ?? "";

	return (
		<div className="flex flex-col gap-6">
			<ProgramInfo
				name={program.name}
				meta={program.meta}
				onChange={programActions.onChange}
				onDuplicate={programActions.onDuplicate}
				onDelete={programActions.onDelete}
			/>
			{firstDayId === undefined ? (
				<CreateDayCard onAddDay={dayActions.onAdd} />
			) : (
				<Section>
					<Tabs
						selectedKey={selectedKey}
						onSelectionChange={handleChangeSelection}
					>
						<DayTabs
							days={days}
							onAddDay={dayActions.onAdd}
							onChangeDayLabel={dayActions.onChangeLabel}
							onDeleteDay={dayActions.onDelete}
						/>
						{selectedDay === undefined ? null : (
							<TabPanel id={selectedDay.id} className="pt-4">
								{children(selectedDay)}
							</TabPanel>
						)}
					</Tabs>
				</Section>
			)}
		</div>
	);
};

type ProgramDetailErrorProps = {
	message?: ReactNode;
};

export const ProgramDetailError: FC<ProgramDetailErrorProps> = ({
	message,
}) => {
	return (
		<div role="alert" className="flex items-start gap-3 p-4">
			<ExclamationTriangleIcon
				aria-hidden
				className="mt-0.5 size-5 shrink-0 text-warning"
			/>
			<div className="flex flex-col gap-1">
				<p className="font-medium text-base text-fg">
					プログラムを取得できませんでした
				</p>
				{message ? <p className="text-muted-fg text-sm">{message}</p> : null}
			</div>
		</div>
	);
};

export const ProgramDetailLoading: FC = () => {
	return (
		<div aria-busy className="flex flex-col gap-6">
			<span className="sr-only" aria-live="polite">
				プログラムを読み込み中
			</span>
			<header className="flex flex-col gap-2">
				<div className={cn(skeletonClass, "h-9 w-64 max-w-full rounded-md")} />
				<div className={cn(skeletonClass, "h-4 w-full max-w-md rounded")} />
			</header>
			<Section>
				<div className="flex gap-2 border-border border-b pb-2">
					<div className={cn(skeletonClass, "h-7 w-28 rounded-md")} />
					<div className={cn(skeletonClass, "h-7 w-20 rounded-md")} />
					<div className={cn(skeletonClass, "h-7 w-20 rounded-md")} />
				</div>
				<div className="flex flex-col gap-3 pt-4">
					<div className={cn(skeletonClass, "h-36 rounded-lg")} />
					<div className={cn(skeletonClass, "h-36 rounded-lg")} />
					<div className={cn(skeletonClass, "mt-2 h-20 rounded-lg")} />
				</div>
			</Section>
		</div>
	);
};
