"use client";

import { useState } from "react";
import type { Day } from "../day-list";
import {
	resolveProgramPlanSelectionState,
	type UseProgramPlanSelectionState,
} from "./resolve-program-plan-selection-state";

export type { UseProgramPlanSelectionState };

type Props = {
	days: Day[];
	initialState?: UseProgramPlanSelectionState | undefined;
};

type Return = [UseProgramPlanSelectionState, UseProgramPlanSelectionAction];

export type UseProgramPlanSelectionAction = {
	selectRoot: () => void;
	selectDay: (dayId: string) => void;
	selectExercisePlan: (dayId: string, exercisePlanId: string) => void;
};

export const useProgramPlanSelection = ({
	days,
	initialState,
}: Props): Return => {
	const [preferredState, setPreferredState] =
		useState<UseProgramPlanSelectionState>(initialState ?? { level: "root" });

	const state = resolveProgramPlanSelectionState(days, preferredState);

	const selectRoot = () => {
		setPreferredState({ level: "root" });
	};

	const selectDay = (dayId: string) => {
		setPreferredState({ level: "day", dayId });
	};

	const selectExercisePlan = (dayId: string, exercisePlanId: string) => {
		setPreferredState({ level: "exercisePlan", dayId, exercisePlanId });
	};

	return [state, { selectRoot, selectDay, selectExercisePlan }];
};
