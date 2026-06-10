"use client";

import type { ComponentProps, FC, ReactNode } from "react";
import { useState } from "react";
import { cn } from "../../libs";
import { ExerciseSelectorComboBox } from "../exercise-selector-combo-box";
import type { ProgramDetailNew } from ".";
import { PlanNodeButton } from "./plan-node-button";

type Day = ComponentProps<typeof ProgramDetailNew>["days"][number];
type AvailableExercise = ComponentProps<
	typeof ProgramDetailNew
>["availableExercises"][number];

type Props = {
	day: Day;
	availableExercises: AvailableExercise[];
	selectedExercisePlanId: string | undefined;
	onSelectExercisePlan: (dayId: string, exercisePlanId: string) => void;
	onAddExercisePlanWithSelectedExercise: (
		dayId: string,
		exerciseId: string,
	) => void;
	onAddExercisePlanWithNewExercise: (dayId: string, name: string) => void;
	workoutHistory: ReactNode;
};

export const ExercisePlanList: FC<Props> = ({
	day,
	availableExercises,
	selectedExercisePlanId,
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
								isSelected={selectedExercisePlanId === exercisePlan.id}
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
					exercises={availableExercises}
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
