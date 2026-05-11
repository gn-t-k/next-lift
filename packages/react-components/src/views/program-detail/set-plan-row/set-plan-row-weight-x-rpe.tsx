"use client";

import type { FC } from "react";
import { RpeField, WeightField } from "./set-plan-edit-form-fields";
import { SetPlanRowEditTrigger } from "./set-plan-row-edit-trigger";
import { SetPlanRowFrame } from "./set-plan-row-frame";

type Value = { weight: number; rpe: number };

type Props = {
	index: number;
	weight: number;
	rpe: number;
	weightUnit: "kg" | "lbs";
	weightStep: number;
	exerciseName: string;
	onChange: (next: Value) => void;
};

export const SetPlanRowWeightXRpe: FC<Props> = ({
	index,
	weight,
	rpe,
	weightUnit,
	weightStep,
	exerciseName,
	onChange,
}) => {
	const title = `${exerciseName} ${index + 1}セット目`;
	return (
		<SetPlanRowFrame
			index={index}
			display={`${weight}${weightUnit} @ RPE ${rpe}`}
		>
			<SetPlanRowEditTrigger title={title}>
				<div className="flex flex-col gap-3">
					<WeightField
						value={weight}
						onChange={(next) =>
							next !== null && onChange({ weight: next, rpe })
						}
						weightUnit={weightUnit}
						weightStep={weightStep}
					/>
					<RpeField
						value={rpe}
						onChange={(next) =>
							next !== null && onChange({ weight, rpe: next })
						}
					/>
				</div>
			</SetPlanRowEditTrigger>
		</SetPlanRowFrame>
	);
};
