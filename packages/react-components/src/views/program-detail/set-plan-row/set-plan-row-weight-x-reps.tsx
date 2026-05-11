"use client";

import type { FC } from "react";
import { RepsField, WeightField } from "./set-plan-edit-form-fields";
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
};

export const SetPlanRowWeightXReps: FC<Props> = ({
	index,
	weight,
	reps,
	weightUnit,
	weightStep,
	exerciseName,
	onChange,
}) => {
	const title = `${exerciseName} ${index + 1}セット目`;
	return (
		<SetPlanRowFrame
			index={index}
			display={`${weight}${weightUnit} × ${reps}回`}
		>
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
		</SetPlanRowFrame>
	);
};
