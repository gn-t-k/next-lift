"use client";

import { XMarkIcon } from "@heroicons/react/24/solid";
import type { ReactNode } from "react";
import { Button } from "../../primitives/button";
import { Heading, Section } from "../../primitives/heading";
import { ExerciseSelector } from "../exercise-selector";
import { CreateExercisePlanCard } from "./create-exercise-plan-card";
import type { WeightUnit } from "./weight-unit";

// T で caller 側の追加フィールド（setPlans 等）を保持し、children 関数に渡せるようにする
type Props<T extends ExercisePlan> = {
	exercisePlans: T[];
	availableExercises: SelectableExercise[];
	onAddExercisePlan: () => void;
	onDeleteExercisePlan: (exercisePlanId: string) => void;
	onSelectExercise: (exercisePlanId: string, exerciseId: string) => void;
	onCreateExercise: (exercisePlanId: string, name: string) => void;
	children: (exercisePlan: T) => ReactNode;
};

type ExercisePlan = {
	id: string;
	exercise: Exercise | null;
};

type Exercise = {
	id: string;
	name: string;
	weightUnit: WeightUnit;
	weightStep: number;
};

type SelectableExercise = {
	id: string;
	name: string;
};

export const ExercisePlanSection = <T extends ExercisePlan>({
	exercisePlans,
	availableExercises,
	onAddExercisePlan,
	onDeleteExercisePlan,
	onSelectExercise,
	onCreateExercise,
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
									{exercisePlan.exercise === null ? (
										<ExerciseSelector
											exercises={availableExercises}
											onSelect={(exerciseId) =>
												onSelectExercise(exercisePlan.id, exerciseId)
											}
											onCreateExercise={(name) =>
												onCreateExercise(exercisePlan.id, name)
											}
										/>
									) : (
										<Heading className="font-medium text-base">
											{exercisePlan.exercise.name}
										</Heading>
									)}
								</header>
								<Button
									intent="plain"
									size="sq-xs"
									aria-label={`${exercisePlan.exercise?.name ?? "未選択の種目計画"}を削除`}
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
			<CreateExercisePlanCard onAddExercisePlan={onAddExercisePlan} />
		</div>
	);
};
