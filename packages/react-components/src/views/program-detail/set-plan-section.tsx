import type { FC } from "react";
import {
	CreateSetPlanRow,
	SetPlanRowRepsXRpe,
	SetPlanRowWeightXReps,
	SetPlanRowWeightXRpe,
} from "./set-plan-row";
import type { SetPlan, SetPlanWithParams, WeightUnit } from "./set-plan-types";

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
		const handleChange = (payload: SetPlanWithParams) =>
			onSetPlanChange(setPlan.id, payload);
		const handleDelete = () => onDeleteSetPlan(setPlan.id);
		switch (setPlan.pattern) {
			case "weight-x-reps":
				return (
					<SetPlanRowWeightXReps
						index={index}
						weight={setPlan.weight}
						reps={setPlan.reps}
						weightUnit={weightUnit}
						weightStep={weightStep}
						exerciseName={exerciseName}
						onChange={handleChange}
						onDelete={handleDelete}
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
						onChange={handleChange}
						onDelete={handleDelete}
					/>
				);
			case "reps-x-rpe":
				return (
					<SetPlanRowRepsXRpe
						index={index}
						reps={setPlan.reps}
						rpe={setPlan.rpe}
						weightUnit={weightUnit}
						weightStep={weightStep}
						exerciseName={exerciseName}
						onChange={handleChange}
						onDelete={handleDelete}
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
				weightStep={weightStep}
				exerciseName={exerciseName}
				onAdd={onAddSetPlan}
			/>
		</div>
	);
};
