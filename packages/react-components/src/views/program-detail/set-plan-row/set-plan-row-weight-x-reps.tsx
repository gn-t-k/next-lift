"use client";

import type { FC } from "react";
import { RepsField, WeightField } from "./set-plan-edit-form-fields";
import { SetPlanRowDeleteButton } from "./set-plan-row-delete-button";
import { SetPlanRowEditTrigger } from "./set-plan-row-edit-trigger";
import { SetPlanRowFrame } from "./set-plan-row-frame";

type Value = { weight: number; reps: number };

type Props = {
	index: number;
	weight: number;
	reps: number;
	weightUnit: "kg" | "lbs";
	weightStep: number;
	exerciseName: string;
	onChange: (next: Value) => void;
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
	const title = `${exerciseName} ${index + 1}セット目`;
	return (
		<SetPlanRowFrame index={index}>
			<span className="flex-1 text-fg tabular-nums">
				{`${weight}${weightUnit} × ${reps}回`}
			</span>
			<SetPlanRowEditTrigger title={title}>
				<div className="flex flex-col gap-3">
					<WeightField
						value={weight}
						onChange={(next) =>
							next !== null && onChange({ weight: next, reps })
						}
						weightUnit={weightUnit}
						weightStep={weightStep}
					/>
					<RepsField
						value={reps}
						onChange={(next) =>
							next !== null && onChange({ weight, reps: next })
						}
					/>
				</div>
			</SetPlanRowEditTrigger>
			<SetPlanRowDeleteButton label={`${title}を削除`} onPress={onDelete} />
		</SetPlanRowFrame>
	);
};
