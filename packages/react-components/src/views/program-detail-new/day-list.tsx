"use client";

import { PlusIcon } from "@heroicons/react/24/outline";
import type { FC } from "react";
import { cn } from "../../libs";
import { Button } from "../../primitives/button";
import { skeletonClass } from "../../primitives/skeleton";
import type { ExercisePlan } from "./exercise-plan-list";
import { PlanNodeButton, PlanNodeButtonSkeleton } from "./plan-node-button";

// Day ドメインの型正本（DayList がリスト UI のオーナー）
export type Day = {
	id: string;
	label: string;
	meta: string | undefined;
	exercisePlans: ExercisePlan[];
};

import type { UseProgramPlanSelectionState } from "./use-program-plan-selection";

type Props = {
	days: Day[];
	state: UseProgramPlanSelectionState;
	onSelectDay: (dayId: string) => void;
	onAddDay: () => void;
};

export type OnSelectDay = Props["onSelectDay"];
export type OnAddDay = Props["onAddDay"];

export const DayList: FC<Props> = ({ days, state, onSelectDay, onAddDay }) => (
	<div className="flex min-h-0 flex-1 flex-col gap-2">
		{days.length > 0 ? (
			<ol className="flex flex-col gap-1">
				{days.map((day) => (
					<li key={day.id}>
						<PlanNodeButton
							label={day.label}
							meta={`${day.exercisePlans.length} 種目計画`}
							isSelected={state.level !== "root" && state.dayId === day.id}
							onSelect={() => onSelectDay(day.id)}
						/>
					</li>
				))}
			</ol>
		) : null}
		<AddDayButton onAddDay={onAddDay} />
	</div>
);

const SKELETON_DAY_KEYS = ["day-1", "day-2", "day-3"] as const;

export const DayListLoading: FC = () => (
	<div className="flex min-h-0 flex-1 flex-col gap-2">
		<ol className="flex flex-col gap-1">
			{SKELETON_DAY_KEYS.map((key) => (
				<li key={key}>
					<PlanNodeButtonSkeleton />
				</li>
			))}
		</ol>
		<AddDayButtonSkeleton />
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

const AddDayButtonSkeleton: FC = () => (
	<div aria-hidden className={cn(skeletonClass, "h-12 w-full rounded-lg")} />
);
