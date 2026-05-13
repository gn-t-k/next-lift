import type { FC } from "react";
import {
	SetPlanAddTrigger,
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

type SetPlanAddPayload = SetPlanChangePayload;

type Props = {
	setPlans: SetPlan[];
	weightUnit: "kg" | "lbs";
	weightStep: number;
	exerciseName: string;
	onSetPlanChange: (setPlanId: string, payload: SetPlanChangePayload) => void;
	onAddSetPlan: (payload: SetPlanAddPayload) => void;
	onDeleteSetPlan: (setPlanId: string) => void;
};

export const SetPlanSection: FC<Props> = ({
	setPlans,
	weightUnit,
	weightStep,
	exerciseName,
	onSetPlanChange,
	onAddSetPlan,
	onDeleteSetPlan,
}) => {
	const renderRow = (setPlan: SetPlan, index: number) => {
		switch (setPlan.pattern) {
			case null:
				return (
					<SetPlanRowEmpty
						index={index}
						exerciseName={exerciseName}
						onDelete={() => onDeleteSetPlan(setPlan.id)}
					/>
				);
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
						onDelete={() => onDeleteSetPlan(setPlan.id)}
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
						onDelete={() => onDeleteSetPlan(setPlan.id)}
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
						onDelete={() => onDeleteSetPlan(setPlan.id)}
					/>
				);
		}
	};
	return (
		<div className="flex flex-col">
			{setPlans.length > 0 && (
				<ol className="flex flex-col">
					{setPlans.map((setPlan, index) => (
						<li key={setPlan.id}>{renderRow(setPlan, index)}</li>
					))}
				</ol>
			)}
			<SetPlanAddTrigger
				setPlans={setPlans}
				weightUnit={weightUnit}
				exerciseName={exerciseName}
				onAdd={onAddSetPlan}
			/>
		</div>
	);
};
