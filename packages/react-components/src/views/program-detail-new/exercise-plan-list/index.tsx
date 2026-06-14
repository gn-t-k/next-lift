"use client";

import type { FC, ReactNode } from "react";
import { useState } from "react";
import { cn } from "../../../libs";
import type { Day } from "../day-list";
import { ExerciseSelectorComboBox } from "./exercise-selector-combo-box";
import { PlanNodeButton } from "../plan-node-button";
import type { SetPlan } from "../set-plan-list";

// 種目計画ドメインの型正本（ExercisePlanList がリスト UI のオーナー）
export type WeightUnit = "kg" | "lbs";

export type Exercise = {
	id: string;
	name: string;
	weightUnit: WeightUnit;
	weightStep: number;
	detailHref: string;
};

export type RegisteredExercise = {
	id: string;
	name: string;
};

export type ExercisePlan = {
	id: string;
	meta: string | undefined;
	exercise: Exercise;
	setPlans: SetPlan[];
};

import type { UseProgramPlanSelectionState } from "./use-program-plan-selection";

type Props = {
	day: Day;
	registeredExercises: RegisteredExercise[];
	state: UseProgramPlanSelectionState;
	onSelectExercisePlan: (dayId: string, exercisePlanId: string) => void;
	onAddExercisePlanWithSelectedExercise: (
		dayId: string,
		exerciseId: string,
	) => void;
	onAddExercisePlanWithNewExercise: (dayId: string, name: string) => void;
	workoutHistory: ReactNode;
};

export type OnSelectExercisePlan = Props["onSelectExercisePlan"];
export type OnAddExercisePlanWithSelectedExercise =
	Props["onAddExercisePlanWithSelectedExercise"];
export type OnAddExercisePlanWithNewExercise =
	Props["onAddExercisePlanWithNewExercise"];
export type RenderWorkoutHistory = (day: Day) => ReactNode;

export const ExercisePlanList: FC<Props> = ({
	day,
	registeredExercises,
	state,
	onSelectExercisePlan,
	onAddExercisePlanWithSelectedExercise,
	onAddExercisePlanWithNewExercise,
	workoutHistory,
}) => {
	const [selectorResetKey, setSelectorResetKey] = useState(0);

	return (
		<div className="flex min-h-0 flex-1 flex-col gap-2">
			{day.exercisePlans.length > 0 ? (
				<ol className="flex flex-col gap-1">
					{day.exercisePlans.map((exercisePlan) => (
						<li key={exercisePlan.id}>
							<PlanNodeButton
								label={exercisePlan.exercise.name}
								meta={`${exercisePlan.setPlans.length} セット計画`}
								isSelected={
									state.level === "exercisePlan" &&
									state.exercisePlanId === exercisePlan.id
								}
								onSelect={() => onSelectExercisePlan(day.id, exercisePlan.id)}
							/>
						</li>
					))}
				</ol>
			) : null}
			<div
				className={cn(
					"[&_[data-slot=control]>[data-slot=control]]:h-12",
					"[&_[data-slot=control]>[data-slot=control]]:rounded-lg",
					"[&_[data-slot=control]>[data-slot=control]]:border-dashed",
					"[&_[data-slot=control]>[data-slot=control]]:bg-transparent",
					"[&_[data-slot=control]>[data-slot=control]]:text-muted-fg",
				)}
			>
				<ExerciseSelectorComboBox
					key={selectorResetKey}
					exercises={registeredExercises}
					label="種目計画を追加"
					onSelect={(exerciseId) => {
						onAddExercisePlanWithSelectedExercise(day.id, exerciseId);
						setSelectorResetKey((key) => key + 1);
					}}
					onCreateExercise={(name) => {
						onAddExercisePlanWithNewExercise(day.id, name);
						setSelectorResetKey((key) => key + 1);
					}}
				/>
			</div>
			{workoutHistory !== undefined ? (
				<div className="mt-2">{workoutHistory}</div>
			) : null}
		</div>
	);
};
