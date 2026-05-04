import type { FC } from "react";
import {
	ExercisePlanRow,
	type ExercisePlanRowExercise,
	type ExercisePlanRowSetPlan,
} from "./exercise-plan-row";
import type { SelectableExercise } from "./exercise-selector";

export type ExercisePlan = {
	id: string;
	exercise: ExercisePlanRowExercise | null;
	setPlans: ExercisePlanRowSetPlan[];
};

type Props = {
	exercisePlans: ExercisePlan[];
	availableExercises: SelectableExercise[];
	onSelectExercise: (params: {
		exercisePlanId: string;
		exerciseId: string;
	}) => void;
};

export const ExercisePlanSection: FC<Props> = ({
	exercisePlans,
	availableExercises,
	onSelectExercise,
}) => {
	return (
		<ol className="flex flex-col gap-3">
			{exercisePlans.map((exercisePlan) => (
				<li key={exercisePlan.id}>
					<ExercisePlanRow
						exercise={exercisePlan.exercise}
						setPlans={exercisePlan.setPlans}
						availableExercises={availableExercises}
						onSelectExercise={(exerciseId) =>
							onSelectExercise({
								exercisePlanId: exercisePlan.id,
								exerciseId,
							})
						}
					/>
				</li>
			))}
		</ol>
	);
};
