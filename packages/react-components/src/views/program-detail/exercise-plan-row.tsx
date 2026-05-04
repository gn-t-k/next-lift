import type { FC } from "react";
import { ExerciseSelector, type SelectableExercise } from "./exercise-selector";
import { type SetPlanParams, SetPlanRow } from "./set-plan-row";

export type ExercisePlanRowSetPlan = {
	id: string;
	params: SetPlanParams | null;
};

export type ExercisePlanRowExercise = {
	id: string;
	name: string;
	weightUnit: "kg" | "lbs";
};

type Props = {
	exercise: ExercisePlanRowExercise | null;
	setPlans: ExercisePlanRowSetPlan[];
	availableExercises: SelectableExercise[];
	onSelectExercise: (exerciseId: string) => void;
};

export const ExercisePlanRow: FC<Props> = ({
	exercise,
	setPlans,
	availableExercises,
	onSelectExercise,
}) => {
	return (
		<section className="flex flex-col gap-2 rounded-lg bg-overlay p-3 text-overlay-fg shadow-sm">
			{exercise === null ? (
				<ExerciseSelector
					availableExercises={availableExercises}
					onSelect={onSelectExercise}
				/>
			) : (
				<header className="flex items-baseline justify-between gap-2 px-1">
					<h3 className="font-medium text-base text-fg">{exercise.name}</h3>
				</header>
			)}
			{setPlans.length > 0 && (
				<ol className="flex flex-col">
					{setPlans.map((setPlan, index) => (
						<li key={setPlan.id}>
							<SetPlanRow
								index={index}
								params={setPlan.params}
								weightUnit={exercise?.weightUnit ?? "kg"}
							/>
						</li>
					))}
				</ol>
			)}
		</section>
	);
};
