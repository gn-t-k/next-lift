import type { FC } from "react";
import {
	CreateSetPlanRow,
	SetPlanRowRepsRpe,
	SetPlanRowWeightReps,
	SetPlanRowWeightRpe,
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
			case "weight-reps":
				return (
					<SetPlanRowWeightReps
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
			case "weight-rpe":
				return (
					<SetPlanRowWeightRpe
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
			case "reps-rpe":
				return (
					<SetPlanRowRepsRpe
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
	const lastSetPlan = setPlans[setPlans.length - 1];
	const lastSetPlanParams =
		lastSetPlan === undefined ? undefined : stripId(lastSetPlan);
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
				lastSetPlan={lastSetPlanParams}
				nextIndex={setPlans.length}
				weightUnit={weightUnit}
				weightStep={weightStep}
				exerciseName={exerciseName}
				onAdd={onAddSetPlan}
			/>
		</div>
	);
};

const stripId = ({ id: _id, ...rest }: SetPlan): SetPlanWithParams => rest;
