"use client";

import { ChevronRightIcon, ListBulletIcon } from "@heroicons/react/24/outline";
import type { FC } from "react";
import { useState } from "react";
import { cn } from "../../libs";
import { Button } from "../../primitives/button";
import { Drawer, DrawerContent, DrawerTitle } from "../../primitives/drawer";
import type { Day } from "./day-list";
import type { UseProgramPlanSelectionState } from "./use-program-plan-selection";

type Props = {
	programName: string;
	days: Day[];
	state: UseProgramPlanSelectionState;
	onSelectRoot: () => void;
	onSelectDay: (dayId: string) => void;
	onSelectExercisePlan: (dayId: string, exercisePlanId: string) => void;
};

export type OnSelectRoot = Props["onSelectRoot"];

export const BreadcrumbJumpSheet: FC<Props> = ({
	programName,
	days,
	state,
	onSelectRoot,
	onSelectDay,
	onSelectExercisePlan,
}) => {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<div className="flex">
			<Drawer isOpen={isOpen} onOpenChange={setIsOpen}>
				<Button
					intent="outline"
					size="sm"
					className="w-full min-w-0 justify-start overflow-hidden bg-overlay px-3 py-2 text-left shadow-sm"
				>
					<ListBulletIcon data-slot="icon" className="size-4" aria-hidden />
					<BreadcrumbLabel
						programName={programName}
						days={days}
						state={state}
					/>
				</Button>
				<DrawerContent
					placement="bottom"
					aria-label="プログラム内を移動"
					className="max-h-[85dvh]"
				>
					<div className="flex min-h-0 flex-col gap-3 pt-2">
						<DrawerTitle className="sr-only">プログラム内を移動</DrawerTitle>
						<JumpTree
							programName={programName}
							days={days}
							state={state}
							onSelectRoot={() => {
								onSelectRoot();
								setIsOpen(false);
							}}
							onSelectDay={(dayId) => {
								onSelectDay(dayId);
								setIsOpen(false);
							}}
							onSelectExercisePlan={(dayId, exercisePlanId) => {
								onSelectExercisePlan(dayId, exercisePlanId);
								setIsOpen(false);
							}}
						/>
					</div>
				</DrawerContent>
			</Drawer>
		</div>
	);
};

type BreadcrumbLabelProps = {
	programName: string;
	days: Day[];
	state: UseProgramPlanSelectionState;
};

const BreadcrumbLabel: FC<BreadcrumbLabelProps> = ({
	programName,
	days,
	state,
}) => {
	const selectedDay =
		state.level === "root"
			? undefined
			: days.find((day) => day.id === state.dayId);
	const selectedExercisePlan =
		state.level === "exercisePlan" && selectedDay !== undefined
			? selectedDay.exercisePlans.find(
					(exercisePlan) => exercisePlan.id === state.exercisePlanId,
				)
			: undefined;

	const segments = [
		{ id: "root", label: programName },
		selectedDay === undefined
			? undefined
			: { id: `day-${selectedDay.id}`, label: selectedDay.label },
		selectedExercisePlan === undefined
			? undefined
			: {
					id: `exercise-${selectedExercisePlan.id}`,
					label: selectedExercisePlan.exercise.name,
				},
	].filter(
		(segment): segment is { id: string; label: string } =>
			segment !== undefined,
	);

	return (
		<span className="flex min-w-0 items-center gap-1">
			{segments.map((segment, index) => (
				<span key={segment.id} className="flex min-w-0 items-center gap-1">
					{index > 0 ? (
						<ChevronRightIcon className="size-3 shrink-0" aria-hidden />
					) : null}
					<span className="truncate">{segment.label}</span>
				</span>
			))}
		</span>
	);
};

type JumpTreeProps = {
	programName: string;
	days: Day[];
	state: UseProgramPlanSelectionState;
	onSelectRoot: () => void;
	onSelectDay: (dayId: string) => void;
	onSelectExercisePlan: (dayId: string, exercisePlanId: string) => void;
};

const JumpTree: FC<JumpTreeProps> = ({
	programName,
	days,
	state,
	onSelectRoot,
	onSelectDay,
	onSelectExercisePlan,
}) => {
	return (
		<ol className="min-h-0 overflow-y-auto">
			<li>
				<JumpRootButton
					programName={programName}
					days={days}
					isCurrent={state.level === "root"}
					onSelectRoot={onSelectRoot}
				/>
			</li>
			{days.map((day) => (
				<li key={day.id}>
					<JumpTreeButton
						label={day.label}
						meta={`${day.exercisePlans.length} 種目計画`}
						depth={1}
						isCurrent={state.level === "day" && state.dayId === day.id}
						onPress={() => onSelectDay(day.id)}
					/>
					{day.exercisePlans.length > 0 ? (
						<ol>
							{day.exercisePlans.map((exercisePlan) => (
								<li key={exercisePlan.id}>
									<JumpTreeButton
										depth={2}
										label={exercisePlan.exercise.name}
										meta={`${exercisePlan.setPlans.length} セット計画`}
										isCurrent={
											state.level === "exercisePlan" &&
											state.dayId === day.id &&
											state.exercisePlanId === exercisePlan.id
										}
										onPress={() =>
											onSelectExercisePlan(day.id, exercisePlan.id)
										}
									/>
								</li>
							))}
						</ol>
					) : null}
				</li>
			))}
		</ol>
	);
};

type JumpRootButtonProps = {
	programName: string;
	days: Day[];
	isCurrent: boolean;
	onSelectRoot: () => void;
};

const JumpRootButton: FC<JumpRootButtonProps> = ({
	programName,
	days,
	isCurrent,
	onSelectRoot,
}) => (
	<Button
		intent="plain"
		size="sm"
		onPress={onSelectRoot}
		className={cn(
			"min-h-11 w-full justify-start border border-transparent px-3 py-2 text-left transition-colors duration-200",
			isCurrent
				? "bg-primary-subtle text-primary-subtle-fg hover:bg-primary-subtle"
				: "text-fg hover:bg-secondary",
		)}
		{...(isCurrent ? currentLocationProps : {})}
	>
		<span className="min-w-0 flex-1">
			<span className="block truncate font-medium">{programName}</span>
			<span className="mt-0.5 block truncate text-muted-fg text-xs">
				{days.length} Day
			</span>
		</span>
	</Button>
);

type JumpTreeButtonProps = {
	depth: number;
	label: string;
	meta: string;
	isCurrent: boolean;
	onPress: () => void;
};

const JumpTreeButton: FC<JumpTreeButtonProps> = ({
	depth,
	label,
	meta,
	isCurrent,
	onPress,
}) => (
	<Button
		intent="plain"
		size="sm"
		onPress={onPress}
		className={cn(
			"min-h-11 w-full justify-start border border-transparent py-2 text-left transition-colors duration-200",
			isCurrent
				? "bg-primary-subtle text-primary-subtle-fg hover:bg-primary-subtle"
				: "text-fg hover:bg-secondary",
		)}
		style={{ paddingInlineStart: `${0.75 + depth * 1.25}rem` }}
		{...(isCurrent ? currentLocationProps : {})}
	>
		<span className="min-w-0 flex-1">
			<span className="block truncate font-medium">{label}</span>
			<span className="mt-0.5 block truncate text-muted-fg text-xs">
				{meta}
			</span>
		</span>
	</Button>
);

const currentLocationProps = {
	"aria-current": "location",
} satisfies { "aria-current": "location" };
