import type { ReactNode } from "react";
import { Heading, Section } from "../../primitives/heading";

// T で caller 側の追加フィールド（setPlans 等）を保持し、children 関数に渡せるようにする
type Props<T extends ExercisePlan> = {
	exercisePlans: T[];
	children: (exercisePlan: T) => ReactNode;
};

type ExercisePlan = {
	id: string;
	exercise: Exercise | null;
};

type Exercise = {
	id: string;
	name: string;
	weightUnit: "kg" | "lbs";
	weightStep: number;
};

export const ExercisePlanSection = <T extends ExercisePlan>({
	exercisePlans,
	children,
}: Props<T>): ReactNode => {
	return (
		<ol className="flex flex-col gap-3">
			{exercisePlans.map((exercisePlan) => (
				<li key={exercisePlan.id}>
					<Section className="flex flex-col gap-2 rounded-lg bg-overlay p-3 text-overlay-fg shadow-sm">
						<header className="flex items-baseline justify-between gap-2 px-1">
							{exercisePlan.exercise === null ? (
								<span className="text-muted-fg text-sm">種目を選択</span>
							) : (
								<Heading className="font-medium text-base">
									{exercisePlan.exercise.name}
								</Heading>
							)}
						</header>
						{children(exercisePlan)}
					</Section>
				</li>
			))}
		</ol>
	);
};
