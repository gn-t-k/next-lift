import type { FC } from "react";
import {
	SetPlanRowEmpty,
	SetPlanRowRepsXRpe,
	SetPlanRowWeightXReps,
	SetPlanRowWeightXRpe,
} from "./set-plan-row";

type SetPlan = { id: string } & (
	| { pattern: null }
	| { pattern: "weight-x-reps"; weight: number; reps: number }
	| { pattern: "weight-x-rpe"; weight: number; rpe: number }
	| { pattern: "reps-x-rpe"; reps: number; rpe: number }
);

type SetPlanChangePayload =
	| { pattern: "weight-x-reps"; weight: number; reps: number }
	| { pattern: "weight-x-rpe"; weight: number; rpe: number }
	| { pattern: "reps-x-rpe"; reps: number; rpe: number };

type Props = {
	setPlans: SetPlan[];
	weightUnit: "kg" | "lbs";
	weightStep: number;
	exerciseName: string;
	onSetPlanChange: (setPlanId: string, payload: SetPlanChangePayload) => void;
};

export const SetPlanSection: FC<Props> = ({
	setPlans,
	weightUnit,
	weightStep,
	exerciseName,
	onSetPlanChange,
}) => {
	const renderRow = (setPlan: SetPlan, index: number) => {
		switch (setPlan.pattern) {
			case null:
				return <SetPlanRowEmpty index={index} />;
			case "weight-x-reps":
				return (
					<SetPlanRowWeightXReps
						index={index}
						weight={setPlan.weight}
						reps={setPlan.reps}
						weightUnit={weightUnit}
						weightStep={weightStep}
						exerciseName={exerciseName}
						onChange={(next) =>
							onSetPlanChange(setPlan.id, { pattern: "weight-x-reps", ...next })
						}
					/>
				);
			case "weight-x-rpe":
				return (
					<SetPlanRowWeightXRpe
						index={index}
						weight={setPlan.weight}
						rpe={setPlan.rpe}
						weightUnit={weightUnit}
						weightStep={weightStep}
						exerciseName={exerciseName}
						onChange={(next) =>
							onSetPlanChange(setPlan.id, { pattern: "weight-x-rpe", ...next })
						}
					/>
				);
			case "reps-x-rpe":
				return (
					<SetPlanRowRepsXRpe
						index={index}
						reps={setPlan.reps}
						rpe={setPlan.rpe}
						exerciseName={exerciseName}
						onChange={(next) =>
							onSetPlanChange(setPlan.id, { pattern: "reps-x-rpe", ...next })
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
