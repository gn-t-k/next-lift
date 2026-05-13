"use client";

import type { FC } from "react";
import type { SetPlanWithParams, WeightUnit } from "../set-plan-types";
import { SetPlanFormDialog } from "./set-plan-form-dialog";
import { SetPlanRowDeleteButton } from "./set-plan-row-delete-button";
import { SetPlanRowFrame } from "./set-plan-row-frame";

type Props = {
	index: number;
	weight: number;
	reps: number;
	weightUnit: WeightUnit;
	weightStep: number;
	exerciseName: string;
	onChange: (next: SetPlanWithParams) => void;
	onDelete: () => void;
};

export const SetPlanRowWeightXReps: FC<Props> = ({
	index,
	weight,
	reps,
	weightUnit,
	weightStep,
	exerciseName,
	onChange,
	onDelete,
}) => {
	const setName = `${exerciseName} ${index + 1}セット目`;
	return (
		<SetPlanRowFrame index={index}>
			<span className="flex-1 text-fg tabular-nums">
				{`${weight}${weightUnit} × ${reps}回`}
			</span>
			<SetPlanFormDialog
				mode="edit"
				exerciseName={exerciseName}
				weightUnit={weightUnit}
				weightStep={weightStep}
				index={index}
				initial={{ pattern: "weight-x-reps", weight, reps }}
				onSubmit={onChange}
			/>
			<SetPlanRowDeleteButton label={`${setName}を削除`} onPress={onDelete} />
		</SetPlanRowFrame>
	);
};
