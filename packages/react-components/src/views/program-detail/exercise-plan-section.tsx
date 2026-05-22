"use client";

import { XMarkIcon } from "@heroicons/react/24/solid";
import type { ComponentProps, ReactNode } from "react";
import { Button } from "../../primitives/button";
import { Heading, Section } from "../../primitives/heading";
import { ExerciseSelector } from "../exercise-selector";
import type { WeightUnit } from "./weight-unit";

// T で caller 側の追加フィールド（setPlans 等）を保持し、children 関数に渡せるようにする
type Props<T extends ExercisePlan> = {
	exercisePlans: T[];
	availableExercises: ComponentProps<typeof ExerciseSelector>["exercises"];
	onAddExercisePlanWithSelectedExercise: (exerciseId: string) => void;
	onAddExercisePlanWithNewExercise: (name: string) => void;
	onDeleteExercisePlan: (exercisePlanId: string) => void;
	children: (exercisePlan: T) => ReactNode;
};

type ExercisePlan = {
	id: string;
	exercise: Exercise;
};

type Exercise = {
	id: string;
	name: string;
	weightUnit: WeightUnit;
	weightStep: number;
};

export const ExercisePlanSection = <T extends ExercisePlan>({
	exercisePlans,
	availableExercises,
	onAddExercisePlanWithSelectedExercise,
	onAddExercisePlanWithNewExercise,
	onDeleteExercisePlan,
	children,
}: Props<T>): ReactNode => {
	return (
		<div className="flex flex-col gap-3">
			{exercisePlans.length > 0 && (
				<ol className="flex flex-col gap-3">
					{exercisePlans.map((exercisePlan) => (
						<li key={exercisePlan.id}>
							<Section className="relative flex flex-col gap-2 rounded-lg bg-overlay p-3 text-overlay-fg shadow-sm">
								<header className="pr-8 pl-1">
									<Heading className="font-medium text-base">
										{exercisePlan.exercise.name}
									</Heading>
								</header>
								<Button
									intent="plain"
									size="sq-xs"
									aria-label={`${exercisePlan.exercise.name}を削除`}
									onPress={() => onDeleteExercisePlan(exercisePlan.id)}
									className="absolute top-2 right-2"
								>
									<XMarkIcon data-slot="icon" className="size-4" aria-hidden />
								</Button>
								{children(exercisePlan)}
							</Section>
						</li>
					))}
				</ol>
			)}
			<ExerciseSelector
				exercises={availableExercises}
				onSelect={onAddExercisePlanWithSelectedExercise}
				onCreateExercise={onAddExercisePlanWithNewExercise}
				label="種目を追加"
			/>
		</div>
	);
};
