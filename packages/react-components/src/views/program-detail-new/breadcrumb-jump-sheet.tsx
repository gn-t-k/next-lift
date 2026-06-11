"use client";

import { ChevronRightIcon, ListBulletIcon } from "@heroicons/react/24/outline";
import type { FC } from "react";
import { useState } from "react";
import { cn } from "../../libs";
import { Button } from "../../primitives/button";
import { Drawer, DrawerContent, DrawerTitle } from "../../primitives/drawer";
import type { Day } from "./day-list";
import type { ExercisePlan } from "./exercise-plan-list";
import type { NavigationTarget } from "./use-program-plan-selection";

type Props = {
	programName: string;
	days: Day[];
	selectedDay: Day | undefined;
	selectedExercisePlan: ExercisePlan | undefined;
	currentTarget: NavigationTarget | undefined;
	onSelectRoot: () => void;
	onSelectTarget: (target: NavigationTarget) => void;
};

export const BreadcrumbJumpSheet: FC<Props> = ({
	programName,
	days,
	selectedDay,
	selectedExercisePlan,
	currentTarget,
	onSelectRoot,
	onSelectTarget,
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
						selectedDay={selectedDay}
						selectedExercisePlan={selectedExercisePlan}
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
							currentTarget={currentTarget}
							onSelectRoot={() => {
								onSelectRoot();
								setIsOpen(false);
							}}
							onSelectTarget={(target) => {
								onSelectTarget(target);
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
	selectedDay: Day | undefined;
	selectedExercisePlan: ExercisePlan | undefined;
};

const BreadcrumbLabel: FC<BreadcrumbLabelProps> = ({
	programName,
	selectedDay,
	selectedExercisePlan,
}) => {
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
	currentTarget: NavigationTarget | undefined;
	onSelectRoot: () => void;
	onSelectTarget: (target: NavigationTarget) => void;
};

const JumpTree: FC<JumpTreeProps> = ({
	programName,
	days,
	currentTarget,
	onSelectRoot,
	onSelectTarget,
}) => {
	return (
		<ol className="min-h-0 overflow-y-auto">
			<li>
				<JumpRootButton
					programName={programName}
					days={days}
					isCurrent={currentTarget?.level === "root"}
					onSelectRoot={onSelectRoot}
				/>
			</li>
			{days.map((day) => {
				const dayTarget: NavigationTarget = {
					level: "day",
					dayId: day.id,
				};
				return (
					<li key={day.id}>
						<JumpTreeButton
							label={day.label}
							meta={`${day.exercisePlans.length} 種目計画`}
							depth={1}
							target={dayTarget}
							currentTarget={currentTarget}
							onSelectTarget={onSelectTarget}
						/>
						{day.exercisePlans.length > 0 ? (
							<ol>
								{day.exercisePlans.map((exercisePlan) => {
									const exerciseTarget: NavigationTarget = {
										level: "exercise",
										dayId: day.id,
										exercisePlanId: exercisePlan.id,
									};
									return (
										<li key={exercisePlan.id}>
											<JumpTreeButton
												depth={2}
												label={exercisePlan.exercise.name}
												meta={`${exercisePlan.setPlans.length} セット計画`}
												target={exerciseTarget}
												currentTarget={currentTarget}
												onSelectTarget={onSelectTarget}
											/>
										</li>
									);
								})}
							</ol>
						) : null}
					</li>
				);
			})}
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
	target: NavigationTarget;
	currentTarget: NavigationTarget | undefined;
	onSelectTarget: (target: NavigationTarget) => void;
};

const JumpTreeButton: FC<JumpTreeButtonProps> = ({
	depth,
	label,
	meta,
	target,
	currentTarget,
	onSelectTarget,
}) => {
	const isCurrent = isSameTarget(target, currentTarget);
	return (
		<Button
			intent="plain"
			size="sm"
			onPress={() => onSelectTarget(target)}
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
};

const currentLocationProps = {
	"aria-current": "location",
} satisfies { "aria-current": "location" };

const isSameTarget = (
	left: NavigationTarget,
	right: NavigationTarget | undefined,
): boolean => {
	if (right === undefined || left.level !== right.level) {
		return false;
	}
	switch (left.level) {
		case "day":
			return right.level === "day" && left.dayId === right.dayId;
		case "exercise":
			return (
				right.level === "exercise" &&
				left.dayId === right.dayId &&
				left.exercisePlanId === right.exercisePlanId
			);
		case "root":
			return right.level === "root";
	}
};
