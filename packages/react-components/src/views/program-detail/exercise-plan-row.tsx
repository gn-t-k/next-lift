import type { FC } from "react";
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
};

export const ExercisePlanRow: FC<Props> = ({ exercise, setPlans }) => {
	return (
		<section className="flex flex-col gap-2 rounded-lg bg-overlay p-3 text-overlay-fg shadow-sm">
			<header className="flex items-baseline justify-between gap-2 px-1">
				{exercise === null ? (
					<span className="text-muted-fg text-sm">種目を選択</span>
				) : (
					<h3 className="font-medium text-base text-fg">{exercise.name}</h3>
				)}
			</header>
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
