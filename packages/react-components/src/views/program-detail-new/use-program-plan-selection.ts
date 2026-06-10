"use client";

import { useCallback, useMemo, useState } from "react";
import type {
	Day,
	ExercisePlan,
	NavigationTarget,
	ProgramPlanSelection,
} from "./types";

type Props = {
	days: Day[];
	defaultSelectedDayId?: string | undefined;
	defaultSelectedExercisePlanId?: string | undefined;
};

export type ResolvedProgramPlanSelection = {
	selection: ProgramPlanSelection;
	selectedDay: Day | undefined;
	selectedExercisePlan: ExercisePlan | undefined;
	selectedSetPlan: ExercisePlan["setPlans"][number] | undefined;
	currentTarget: NavigationTarget | undefined;
	selectDay: (dayId: string) => void;
	selectExercisePlan: (dayId: string, exercisePlanId: string) => void;
	selectRoot: () => void;
	selectTarget: (target: NavigationTarget) => void;
};

export const useProgramPlanSelection = ({
	days,
	defaultSelectedDayId,
	defaultSelectedExercisePlanId,
}: Props): ResolvedProgramPlanSelection => {
	const [preferredSelection, setPreferredSelection] =
		useState<ProgramPlanSelection>(() => ({
			dayId: defaultSelectedDayId,
			exercisePlanId: defaultSelectedExercisePlanId,
		}));

	const resolved = useMemo(
		() => resolveSelection(days, preferredSelection),
		[days, preferredSelection],
	);

	const selectDay = useCallback((dayId: string) => {
		setPreferredSelection({ dayId });
	}, []);

	const selectExercisePlan = useCallback(
		(dayId: string, exercisePlanId: string) => {
			setPreferredSelection({ dayId, exercisePlanId });
		},
		[],
	);

	const selectRoot = useCallback(() => {
		setPreferredSelection({});
	}, []);

	const selectTarget = useCallback(
		(target: NavigationTarget) => {
			switch (target.level) {
				case "root":
					selectRoot();
					return;
				case "day":
					selectDay(target.dayId);
					return;
				case "exercise":
					selectExercisePlan(target.dayId, target.exercisePlanId);
					return;
			}
		},
		[selectDay, selectExercisePlan, selectRoot],
	);

	return {
		...resolved,
		selectDay,
		selectExercisePlan,
		selectRoot,
		selectTarget,
	};
};

const resolveSelection = (
	days: Day[],
	preferredSelection: ProgramPlanSelection,
): Pick<
	ResolvedProgramPlanSelection,
	| "selection"
	| "selectedDay"
	| "selectedExercisePlan"
	| "selectedSetPlan"
	| "currentTarget"
> => {
	const selectedDay = days.find((day) => day.id === preferredSelection.dayId);
	const selectedExercisePlan = selectedDay?.exercisePlans.find(
		(exercisePlan) => exercisePlan.id === preferredSelection.exercisePlanId,
	);
	const selectedSetPlan = selectedExercisePlan?.setPlans.find(
		(setPlan) => setPlan.id === preferredSelection.setPlanId,
	);
	const selection = {
		dayId: selectedDay?.id,
		exercisePlanId: selectedExercisePlan?.id,
		setPlanId: selectedSetPlan?.id,
	};

	return {
		selection,
		selectedDay,
		selectedExercisePlan,
		selectedSetPlan,
		currentTarget: resolveCurrentTarget(selection),
	};
};

const resolveCurrentTarget = (
	selection: ProgramPlanSelection,
): NavigationTarget | undefined => {
	if (selection.dayId !== undefined && selection.exercisePlanId !== undefined) {
		return {
			level: "exercise",
			dayId: selection.dayId,
			exercisePlanId: selection.exercisePlanId,
		};
	}
	if (selection.dayId !== undefined) {
		return { level: "day", dayId: selection.dayId };
	}
	return { level: "root" };
};
