import type { FC } from "react";
import {
	CreateSetPlanRow,
	SetPlanRowEmpty,
	SetPlanRowRepsXRpe,
	SetPlanRowWeightXReps,
	SetPlanRowWeightXRpe,
} from "./set-plan-row";
import type {
	Pattern,
	SetPlan,
	SetPlanWithParams,
	WeightUnit,
} from "./set-plan-types";

type Props = {
	setPlans: SetPlan[];
	weightUnit: WeightUnit;
	weightStep: number;
	exerciseName: string;
	onSetPlanChange: (setPlanId: string, payload: SetPlanWithParams) => void;
	onAddSetPlan: (payload: SetPlanWithParams) => void;
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
						onSelectKind={(kind) =>
							onSetPlanChange(setPlan.id, defaultPayloadFor(kind))
						}
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
			<CreateSetPlanRow
				setPlans={setPlans}
				weightUnit={weightUnit}
				exerciseName={exerciseName}
				onAdd={onAddSetPlan}
			/>
		</div>
	);
};

const defaultPayloadFor = (kind: Pattern): SetPlanWithParams => {
	switch (kind) {
		case "weight-x-reps":
			return { pattern: "weight-x-reps", weight: 0, reps: 0 };
		case "weight-x-rpe":
			return { pattern: "weight-x-rpe", weight: 0, rpe: 8 };
		case "reps-x-rpe":
			return { pattern: "reps-x-rpe", reps: 0, rpe: 8 };
	}
};
