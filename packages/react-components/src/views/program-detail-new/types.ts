import type { ReactNode } from "react";
import type {
	SetPlan,
	SetPlanDraft,
} from "../program-detail/set-plan-section/set-plan-types";
import type { WeightUnit } from "../program-detail/weight-unit";

export type ProgramDetailNewProps = {
	name: string;
	meta: string | null;
	days: Day[];
	availableExercises: AvailableExercise[];
	defaultSelectedDayId?: string | undefined;
	defaultSelectedExercisePlanId?: string | undefined;
	onAddDay: () => void;
	onDeleteDay: (dayId: string) => void;
	onChangeDayLabel: (dayId: string, label: string) => void;
	onChangeDayInfo?: (
		dayId: string,
		payload: { label: string; memo: string | null },
	) => void;
	onChangeProgramInfo: (payload: { name: string; meta: string | null }) => void;
	onDuplicate: () => void;
	onDelete: () => void;
	onAddExercisePlanWithSelectedExercise: (
		dayId: string,
		exerciseId: string,
	) => void;
	onAddExercisePlanWithNewExercise: (dayId: string, name: string) => void;
	onChangeExercisePlanInfo: (
		exercisePlanId: string,
		payload: { memo: string | null },
	) => void;
	onDeleteExercisePlan: (exercisePlanId: string) => void;
	onChangeSetPlan: (setPlanId: string, payload: SetPlanDraft) => void;
	onAddSetPlan: (exercisePlanId: string, payload: SetPlanDraft) => void;
	onDeleteSetPlan: (setPlanId: string) => void;
	lastAddedExercisePlanId?: string | undefined;
	lastAddedDayId?: string | undefined;
	renderWorkoutHistory: (day: Day) => ReactNode;
	renderExerciseProgress: (exercisePlan: ExercisePlan) => ReactNode;
};

export type Day = {
	id: string;
	label: string;
	memo?: string | null | undefined;
	exercisePlans: ExercisePlan[];
};

export type ExercisePlan = {
	id: string;
	memo?: string | null | undefined;
	exercise: Exercise;
	setPlans: SetPlan[];
};

export type Exercise = {
	id: string;
	name: string;
	weightUnit: WeightUnit;
	weightStep: number;
	detailHref: string;
};

export type AvailableExercise = {
	id: string;
	name: string;
};

export type ProgramPlanSelection = {
	dayId?: string | undefined;
	exercisePlanId?: string | undefined;
	setPlanId?: string | undefined;
};

export type NavigationTarget =
	| { level: "root" }
	| { level: "day"; dayId: string }
	| { level: "exercise"; dayId: string; exercisePlanId: string };
