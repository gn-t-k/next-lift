"use client";

import { PlusIcon } from "@heroicons/react/24/outline";
import type { FC } from "react";
import { cn } from "../../libs";
import { Button } from "../../primitives/button";
import type { ExercisePlan } from "./exercise-plan-list";
import { PlanNodeButton } from "./plan-node-button";

// Day ドメインの型正本（DayList がリスト UI のオーナー）
export type Day = {
	id: string;
	label: string;
	memo?: string | undefined;
	exercisePlans: ExercisePlan[];
};

type Props = {
	days: Day[];
	selectedDayId: string | undefined;
	onSelectDay: (dayId: string) => void;
	onAddDay: () => void;
};

export const DayList: FC<Props> = ({
	days,
	selectedDayId,
	onSelectDay,
	onAddDay,
}) => (
	<div className="flex min-h-0 flex-1 flex-col gap-2">
		{days.length > 0 ? (
			<ol className="flex flex-col gap-1">
				{days.map((day) => (
					<li key={day.id}>
						<PlanNodeButton
							label={day.label}
							meta={`${day.exercisePlans.length} 種目計画`}
							isSelected={selectedDayId === day.id}
							onSelect={() => onSelectDay(day.id)}
						/>
					</li>
				))}
			</ol>
		) : null}
		<AddDayButton onAddDay={onAddDay} />
	</div>
);

type AddDayButtonProps = {
	onAddDay: () => void;
};

const AddDayButton: FC<AddDayButtonProps> = ({ onAddDay }) => (
	<Button
		intent="plain"
		size="sm"
		onPress={onAddDay}
		className={cn(
			"h-12 w-full justify-start border-border border-dashed px-3 py-2 text-muted-fg sm:h-12",
			"hover:border-solid hover:bg-secondary hover:text-fg",
		)}
	>
		<PlusIcon data-slot="icon" className="size-4" aria-hidden />
		Day を追加
	</Button>
);
