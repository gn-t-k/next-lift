"use client";

import { type FC, useState } from "react";
import {
	type RepsXRpeDraft,
	SetPlanEditFormRepsXRpe,
} from "./set-plan-edit-form-reps-x-rpe";
import { SetPlanRowEditTrigger } from "./set-plan-row-edit-trigger";
import { SetPlanRowFrame } from "./set-plan-row-frame";

type Value = { reps: number; rpe: number };

type Props = {
	index: number;
	reps: number;
	rpe: number;
	exerciseName: string;
	onChange: (next: Value) => void;
};

export const SetPlanRowRepsXRpe: FC<Props> = ({
	index,
	reps,
	rpe,
	exerciseName,
	onChange,
}) => {
	const [draft, setDraft] = useState<RepsXRpeDraft | null>(null);
	const start = () => setDraft({ reps, rpe });
	const cancel = () => setDraft(null);
	const submit = () => {
		if (draft === null) return;
		if (draft.reps === null || draft.rpe === null) return;
		onChange({ reps: draft.reps, rpe: draft.rpe });
		setDraft(null);
	};
	const handleOpenChange = (isOpen: boolean) => {
		if (!isOpen) cancel();
	};
	const title = `${exerciseName} ${index + 1}セット目`;
	return (
		<SetPlanRowFrame index={index} display={`${reps}回 @ RPE ${rpe}`}>
			<SetPlanRowEditTrigger
				title={title}
				isOpen={draft !== null}
				onOpenChange={handleOpenChange}
				onStart={start}
			>
				{draft !== null && (
					<SetPlanEditFormRepsXRpe
						draft={draft}
						onUpdate={setDraft}
						onSubmit={submit}
					/>
				)}
			</SetPlanRowEditTrigger>
		</SetPlanRowFrame>
	);
};
