import type { FC } from "react";
import {
	ExercisePlanRow,
	type ExercisePlanRowExercise,
	type ExercisePlanRowSetPlan,
} from "./exercise-plan-row";

export type ExercisePlan = {
	id: string;
	exercise: ExercisePlanRowExercise | null;
	setPlans: ExercisePlanRowSetPlan[];
};

type Props = {
	exercisePlans: ExercisePlan[];
};

export const ExercisePlanSection: FC<Props> = ({ exercisePlans }) => {
	return (
		<ol className="flex flex-col gap-3">
			{exercisePlans.map((exercisePlan) => (
				<li key={exercisePlan.id}>
					<ExercisePlanRow
						exercise={exercisePlan.exercise}
						setPlans={exercisePlan.setPlans}
					/>
				</li>
			))}
		</ol>
	);
};
