"use client";

import type { FC } from "react";
import { RepsField, RpeField } from "./set-plan-edit-form-fields";
import { SetPlanRowDeleteButton } from "./set-plan-row-delete-button";
import { SetPlanRowEditTrigger } from "./set-plan-row-edit-trigger";
import { SetPlanRowFrame } from "./set-plan-row-frame";

type Value = { reps: number; rpe: number };

type Props = {
	index: number;
	reps: number;
	rpe: number;
	exerciseName: string;
	onChange: (next: Value) => void;
	onDelete: () => void;
};

export const SetPlanRowRepsXRpe: FC<Props> = ({
	index,
	reps,
	rpe,
	exerciseName,
	onChange,
	onDelete,
}) => {
	const title = `${exerciseName} ${index + 1}セット目`;
	return (
		<SetPlanRowFrame index={index}>
			<span className="flex-1 text-fg tabular-nums">
				{`${reps}回 @ RPE ${rpe}`}
			</span>
			<SetPlanRowEditTrigger title={title}>
				<div className="flex flex-col gap-3">
					<RepsField
						value={reps}
						onChange={(next) => next !== null && onChange({ reps: next, rpe })}
					/>
					<RpeField
						value={rpe}
						onChange={(next) => next !== null && onChange({ reps, rpe: next })}
					/>
				</div>
			</SetPlanRowEditTrigger>
			<SetPlanRowDeleteButton label={`${title}を削除`} onPress={onDelete} />
		</SetPlanRowFrame>
	);
};
