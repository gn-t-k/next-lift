"use client";

import type { FC, ReactNode } from "react";
import { useRef } from "react";
import { cn } from "../../../libs";
import type { Day } from "../day-list";
import type { UseProgramPlanSelectionState } from "../use-program-plan-selection";

type Props = {
	days: Day[];
	state: UseProgramPlanSelectionState;
	children: ReactNode;
};

export const DrilldownTransition: FC<Props> = ({ days, state, children }) => {
	const previousStateRef = useRef<UseProgramPlanSelectionState | undefined>(
		state,
	);
	const previousState = previousStateRef.current;
	const animationClass = getTransitionClass(days, previousState, state);
	previousStateRef.current = state;

	return (
		<div
			key={formatStateKey(state)}
			className={cn("duration-200 motion-safe:animate-in", animationClass)}
		>
			{children}
		</div>
	);
};

const getTransitionClass = (
	days: Day[],
	previousState: UseProgramPlanSelectionState | undefined,
	nextState: UseProgramPlanSelectionState,
): string => {
	if (previousState === undefined) {
		return "fade-in";
	}

	const previousDepth = getStateDepth(previousState);
	const nextDepth = getStateDepth(nextState);
	if (nextDepth > previousDepth) {
		return "fade-in slide-in-from-right-4";
	}
	if (nextDepth < previousDepth) {
		return "fade-in slide-in-from-left-4";
	}

	const siblingDelta =
		getSiblingIndex(days, nextState) - getSiblingIndex(days, previousState);
	if (siblingDelta > 0) {
		return "fade-in slide-in-from-top-4";
	}
	if (siblingDelta < 0) {
		return "fade-in slide-in-from-bottom-4";
	}
	return "fade-in";
};

const getStateDepth = (state: UseProgramPlanSelectionState): number => {
	switch (state.level) {
		case "root":
			return 0;
		case "day":
			return 1;
		case "exercisePlan":
			return 2;
	}
};

const getSiblingIndex = (
	days: Day[],
	state: UseProgramPlanSelectionState,
): number => {
	switch (state.level) {
		case "root":
			return 0;
		case "day":
			return days.findIndex((day) => day.id === state.dayId);
		case "exercisePlan": {
			const day = days.find((candidate) => candidate.id === state.dayId);
			return (
				day?.exercisePlans.findIndex(
					(exercisePlan) => exercisePlan.id === state.exercisePlanId,
				) ?? -1
			);
		}
	}
};

const formatStateKey = (state: UseProgramPlanSelectionState): string => {
	switch (state.level) {
		case "root":
			return "root";
		case "day":
			return `day:${state.dayId}`;
		case "exercisePlan":
			return `exercisePlan:${state.dayId}:${state.exercisePlanId}`;
	}
};
