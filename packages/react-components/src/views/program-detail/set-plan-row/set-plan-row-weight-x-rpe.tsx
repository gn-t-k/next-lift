"use client";

import { type FC, useState } from "react";
import {
	SetPlanEditFormWeightXRpe,
	type WeightXRpeDraft,
} from "./set-plan-edit-form-weight-x-rpe";
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
	const [draft, setDraft] = useState<WeightXRpeDraft | null>(null);
	const start = () => setDraft({ weight, rpe });
	const cancel = () => setDraft(null);
	const submit = () => {
		if (draft === null) return;
		if (draft.weight === null || draft.rpe === null) return;
		onChange({ weight: draft.weight, rpe: draft.rpe });
		setDraft(null);
	};
	const handleOpenChange = (isOpen: boolean) => {
		if (!isOpen) cancel();
	};
	const title = `${exerciseName} ${index + 1}セット目`;
	return (
		<SetPlanRowFrame
			index={index}
			display={`${weight}${weightUnit} @ RPE ${rpe}`}
		>
			<SetPlanRowEditTrigger
				title={title}
				isOpen={draft !== null}
				onOpenChange={handleOpenChange}
				onStart={start}
			>
				{draft !== null && (
					<SetPlanEditFormWeightXRpe
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
