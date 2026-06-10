"use client";

import { useState } from "react";

type SelectableExercisePlan = {
	id: string;
};

type SelectableDay = {
	id: string;
	exercisePlans: SelectableExercisePlan[];
};

type Props<Day extends SelectableDay> = {
	days: Day[];
	defaultSelectedDayId?: string | undefined;
	defaultSelectedExercisePlanId?: string | undefined;
};

export type ProgramPlanSelection = {
	dayId?: string | undefined;
	exercisePlanId?: string | undefined;
};

export type NavigationTarget =
	| { level: "root" }
	| { level: "day"; dayId: string }
	| { level: "exercise"; dayId: string; exercisePlanId: string };

type ResolvedProgramPlanSelection<Day extends SelectableDay> = {
	selection: ProgramPlanSelection;
	selectedDay: Day | undefined;
	selectedExercisePlan: Day["exercisePlans"][number] | undefined;
	currentTarget: NavigationTarget | undefined;
	selectDay: (dayId: string) => void;
	selectExercisePlan: (dayId: string, exercisePlanId: string) => void;
	selectRoot: () => void;
	selectTarget: (target: NavigationTarget) => void;
};

export const useProgramPlanSelection = <Day extends SelectableDay>({
	days,
	defaultSelectedDayId,
	defaultSelectedExercisePlanId,
}: Props<Day>): ResolvedProgramPlanSelection<Day> => {
	const [preferredSelection, setPreferredSelection] =
		useState<ProgramPlanSelection>(() => ({
			dayId: defaultSelectedDayId,
			exercisePlanId: defaultSelectedExercisePlanId,
		}));

	const resolved = resolveSelection(days, preferredSelection);

	const selectDay = (dayId: string) => {
		setPreferredSelection({ dayId });
	};

	const selectExercisePlan = (dayId: string, exercisePlanId: string) => {
		setPreferredSelection({ dayId, exercisePlanId });
	};

	const selectRoot = () => {
		setPreferredSelection({});
	};

	const selectTarget = (target: NavigationTarget) => {
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
	};

	return {
		...resolved,
		selectDay,
		selectExercisePlan,
		selectRoot,
		selectTarget,
	};
};

const resolveSelection = <Day extends SelectableDay>(
	days: Day[],
	preferredSelection: ProgramPlanSelection,
): Pick<
	ResolvedProgramPlanSelection<Day>,
	"selection" | "selectedDay" | "selectedExercisePlan" | "currentTarget"
> => {
	const selectedDay = days.find((day) => day.id === preferredSelection.dayId);
	const selectedExercisePlan = selectedDay?.exercisePlans.find(
		(exercisePlan) => exercisePlan.id === preferredSelection.exercisePlanId,
	);
	const selection = {
		dayId: selectedDay?.id,
		exercisePlanId: selectedExercisePlan?.id,
	};

	return {
		selection,
		selectedDay,
		selectedExercisePlan,
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
