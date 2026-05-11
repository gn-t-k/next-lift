"use client";

import { type FC, useState } from "react";
import {
	SetPlanEditFormWeightXReps,
	type WeightXRepsDraft,
} from "./set-plan-edit-form-weight-x-reps";
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
	const [draft, setDraft] = useState<WeightXRepsDraft | null>(null);
	const start = () => setDraft({ weight, reps });
	const cancel = () => setDraft(null);
	const submit = () => {
		if (draft === null) return;
		if (draft.weight === null || draft.reps === null) return;
		onChange({ weight: draft.weight, reps: draft.reps });
		setDraft(null);
	};
	const handleOpenChange = (isOpen: boolean) => {
		if (!isOpen) cancel();
	};
	const title = `${exerciseName} ${index + 1}セット目`;
	return (
		<SetPlanRowFrame
			index={index}
			display={`${weight}${weightUnit} × ${reps}回`}
		>
			<SetPlanRowEditTrigger
				title={title}
				isOpen={draft !== null}
				onOpenChange={handleOpenChange}
				onStart={start}
			>
				{draft !== null && (
					<SetPlanEditFormWeightXReps
						draft={draft}
						weightUnit={weightUnit}
						weightStep={weightStep}
						onUpdate={setDraft}
						onSubmit={submit}
					/>
				)}
			</SetPlanRowEditTrigger>
		</SetPlanRowFrame>
	);
};
