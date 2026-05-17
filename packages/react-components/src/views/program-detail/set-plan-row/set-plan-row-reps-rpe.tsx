"use client";

import type { FC } from "react";
import type { SetPlanWithParams, WeightUnit } from "../set-plan-types";
import { formatSetPlanSummary } from "./format-set-plan-summary";
import { SetPlanEditDialog } from "./set-plan-edit-dialog";
import { SetPlanRowDeleteButton } from "./set-plan-row-delete-button";
import { SetPlanRowFrame } from "./set-plan-row-frame";

type Props = {
	index: number;
	reps: number;
	rpe: number;
	weightUnit: WeightUnit;
	weightStep: number;
	exerciseName: string;
	onChange: (next: SetPlanWithParams) => void;
	onDelete: () => void;
};

export const SetPlanRowRepsRpe: FC<Props> = ({
	index,
	reps,
	rpe,
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
				{formatSetPlanSummary({ pattern: "reps-rpe", reps, rpe }, weightUnit)}
			</span>
			<SetPlanEditDialog
				exerciseName={exerciseName}
				weightUnit={weightUnit}
				weightStep={weightStep}
				index={index}
				current={{ pattern: "reps-rpe", reps, rpe }}
				onChange={onChange}
			/>
			<SetPlanRowDeleteButton label={`${setName}を削除`} onPress={onDelete} />
		</SetPlanRowFrame>
	);
};
