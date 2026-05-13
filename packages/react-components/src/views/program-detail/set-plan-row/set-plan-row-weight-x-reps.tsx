"use client";

import type { FC } from "react";
import { useRef, useState } from "react";
import { RepsField, WeightField } from "./set-plan-edit-form-fields";
import { SetPlanRowEditTrigger } from "./set-plan-row-edit-trigger";
import { SetPlanRowFrame } from "./set-plan-row-frame";

type Value = { weight: number; reps: number };
type Draft = { weight: number | null; reps: number | null };

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
	const [isOpen, setIsOpen] = useState(false);
	const [draft, setDraft] = useState<Draft | null>(null);
	const draftRef = useRef<Draft | null>(null);

	const writeDraft = (next: Draft) => {
		draftRef.current = next;
		setDraft(next);
	};

	const handleOpenChange = (open: boolean) => {
		if (open) {
			writeDraft({ weight, reps });
		} else {
			draftRef.current = null;
			setDraft(null);
		}
		setIsOpen(open);
	};

	const handleCommit = () => {
		const current = draftRef.current;
		if (current?.weight != null && current.reps != null) {
			onChange({ weight: current.weight, reps: current.reps });
		}
		draftRef.current = null;
		setDraft(null);
		setIsOpen(false);
	};

	const isCommitDisabled =
		draft === null || draft.weight === null || draft.reps === null;

	return (
		<SetPlanRowFrame
			index={index}
			display={`${weight}${weightUnit} × ${reps}回`}
		>
			<SetPlanRowEditTrigger
				title={title}
				isOpen={isOpen}
				onOpenChange={handleOpenChange}
				onCommit={handleCommit}
				isCommitDisabled={isCommitDisabled}
			>
				<WeightField
					value={draft === null ? weight : draft.weight}
					onChange={(next) =>
						writeDraft({ weight: next, reps: draft?.reps ?? reps })
					}
					weightUnit={weightUnit}
					weightStep={weightStep}
				/>
				<RepsField
					value={draft === null ? reps : draft.reps}
					onChange={(next) =>
						writeDraft({ weight: draft?.weight ?? weight, reps: next })
					}
				/>
			</SetPlanRowEditTrigger>
		</SetPlanRowFrame>
	);
};
