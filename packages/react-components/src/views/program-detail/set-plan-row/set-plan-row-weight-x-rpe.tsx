"use client";

import type { FC } from "react";
import { useRef, useState } from "react";
import type { WeightUnit } from "../set-plan-types";
import { RpeField, WeightField } from "./set-plan-edit-form-fields";
import { SetPlanRowDeleteButton } from "./set-plan-row-delete-button";
import { SetPlanRowEditTrigger } from "./set-plan-row-edit-trigger";
import { SetPlanRowFrame } from "./set-plan-row-frame";

type Value = { weight: number; rpe: number };
type Draft = { weight: number | null; rpe: number | null };

type Props = {
	index: number;
	weight: number;
	rpe: number;
	weightUnit: WeightUnit;
	weightStep: number;
	exerciseName: string;
	onChange: (next: Value) => void;
	onDelete: () => void;
};

export const SetPlanRowWeightXRpe: FC<Props> = ({
	index,
	weight,
	rpe,
	weightUnit,
	weightStep,
	exerciseName,
	onChange,
	onDelete,
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
			writeDraft({ weight, rpe });
		} else {
			draftRef.current = null;
			setDraft(null);
		}
		setIsOpen(open);
	};

	const handleCommit = () => {
		const current = draftRef.current;
		if (current?.weight != null && current.rpe != null) {
			onChange({ weight: current.weight, rpe: current.rpe });
		}
		draftRef.current = null;
		setDraft(null);
		setIsOpen(false);
	};

	const isCommitDisabled =
		draft === null || draft.weight === null || draft.rpe === null;

	return (
		<SetPlanRowFrame index={index}>
			<span className="flex-1 text-fg tabular-nums">
				{`${weight}${weightUnit} @ RPE ${rpe}`}
			</span>
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
						writeDraft({ weight: next, rpe: draft?.rpe ?? rpe })
					}
					weightUnit={weightUnit}
					weightStep={weightStep}
				/>
				<RpeField
					value={draft === null ? rpe : draft.rpe}
					onChange={(next) =>
						writeDraft({ weight: draft?.weight ?? weight, rpe: next })
					}
				/>
			</SetPlanRowEditTrigger>
			<SetPlanRowDeleteButton label={`${title}を削除`} onPress={onDelete} />
		</SetPlanRowFrame>
	);
};
