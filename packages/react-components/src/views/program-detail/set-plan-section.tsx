import type { FC } from "react";
import {
	SetPlanRowEmpty,
	SetPlanRowRepsXRpe,
	SetPlanRowWeightXReps,
	SetPlanRowWeightXRpe,
} from "./set-plan-row";

type SetPlanPattern =
	| { kind: "weight-x-reps"; weight: number; reps: number }
	| { kind: "weight-x-rpe"; weight: number; rpe: number }
	| { kind: "reps-x-rpe"; reps: number; rpe: number };

type Props = {
	setPlans: { id: string; pattern: SetPlanPattern | null }[];
	weightUnit: "kg" | "lbs";
	weightStep: number;
	exerciseName: string;
	onSetPlanChange: (setPlanId: string, pattern: SetPlanPattern) => void;
};

export const SetPlanSection: FC<Props> = ({
	setPlans,
	weightUnit,
	weightStep,
	exerciseName,
	onSetPlanChange,
}) => {
	const renderRow = (
		setPlan: { id: string; pattern: SetPlanPattern | null },
		index: number,
	) => {
		const { pattern } = setPlan;
		if (pattern === null) return <SetPlanRowEmpty index={index} />;
		switch (pattern.kind) {
			case "weight-x-reps":
				return (
					<SetPlanRowWeightXReps
						index={index}
						weight={pattern.weight}
						reps={pattern.reps}
						weightUnit={weightUnit}
						weightStep={weightStep}
						exerciseName={exerciseName}
						onChange={(next) =>
							onSetPlanChange(setPlan.id, { kind: "weight-x-reps", ...next })
						}
					/>
				);
			case "weight-x-rpe":
				return (
					<SetPlanRowWeightXRpe
						index={index}
						weight={pattern.weight}
						rpe={pattern.rpe}
						weightUnit={weightUnit}
						weightStep={weightStep}
						exerciseName={exerciseName}
						onChange={(next) =>
							onSetPlanChange(setPlan.id, { kind: "weight-x-rpe", ...next })
						}
					/>
				);
			case "reps-x-rpe":
				return (
					<SetPlanRowRepsXRpe
						index={index}
						reps={pattern.reps}
						rpe={pattern.rpe}
						exerciseName={exerciseName}
						onChange={(next) =>
							onSetPlanChange(setPlan.id, { kind: "reps-x-rpe", ...next })
						}
					/>
				);
		}
	};
	if (setPlans.length === 0) return null;
	return (
		<ol className="flex flex-col">
			{setPlans.map((setPlan, index) => (
				<li key={setPlan.id}>{renderRow(setPlan, index)}</li>
			))}
		</ol>
	);
};
