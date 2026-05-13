"use client";

import type { FC } from "react";
import { useRef, useState } from "react";
import { RepsField, RpeField } from "./set-plan-edit-form-fields";
import { SetPlanRowEditTrigger } from "./set-plan-row-edit-trigger";
import { SetPlanRowFrame } from "./set-plan-row-frame";

type Value = { reps: number; rpe: number };
type Draft = { reps: number | null; rpe: number | null };

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
	const title = `${exerciseName} ${index + 1}セット目`;
	const [isOpen, setIsOpen] = useState(false);
	const [draft, setDraft] = useState<Draft | null>(null);
	const draftRef = useRef<Draft | null>(null);

	const writeDraft = (next: Draft) => {
		draftRef.current = next;
		setDraft(next);
	};

	const handleOpenChange = (open: boolean) => {
		if (open) {
			writeDraft({ reps, rpe });
		} else {
			draftRef.current = null;
			setDraft(null);
		}
		setIsOpen(open);
	};

	const handleCommit = () => {
		const current = draftRef.current;
		if (current?.reps != null && current.rpe != null) {
			onChange({ reps: current.reps, rpe: current.rpe });
		}
		draftRef.current = null;
		setDraft(null);
		setIsOpen(false);
	};

	const isCommitDisabled =
		draft === null || draft.reps === null || draft.rpe === null;

	return (
		<SetPlanRowFrame index={index} display={`${reps}回 @ RPE ${rpe}`}>
			<SetPlanRowEditTrigger
				title={title}
				isOpen={isOpen}
				onOpenChange={handleOpenChange}
				onCommit={handleCommit}
				isCommitDisabled={isCommitDisabled}
			>
				<RepsField
					value={draft === null ? reps : draft.reps}
					onChange={(next) =>
						writeDraft({ reps: next, rpe: draft?.rpe ?? rpe })
					}
				/>
				<RpeField
					value={draft === null ? rpe : draft.rpe}
					onChange={(next) =>
						writeDraft({ reps: draft?.reps ?? reps, rpe: next })
					}
				/>
			</SetPlanRowEditTrigger>
		</SetPlanRowFrame>
	);
};
