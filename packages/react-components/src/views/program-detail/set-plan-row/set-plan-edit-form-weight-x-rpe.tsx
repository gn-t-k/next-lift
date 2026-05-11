"use client";

import { CheckIcon } from "@heroicons/react/24/solid";
import type { FC, FormEvent } from "react";
import { Button } from "../../../primitives/button";
import { RpeField, WeightField } from "./set-plan-edit-form-fields";

export type WeightXRpeDraft = {
	weight: number | null;
	rpe: number | null;
};

type Props = {
	draft: WeightXRpeDraft;
	weightUnit: "kg" | "lbs";
	weightStep: number;
	onUpdate: (draft: WeightXRpeDraft) => void;
	onSubmit: () => void;
};

export const SetPlanEditFormWeightXRpe: FC<Props> = ({
	draft,
	weightUnit,
	weightStep,
	onUpdate,
	onSubmit,
}) => {
	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		onSubmit();
	};
	const isInvalid = draft.weight === null || draft.rpe === null;
	return (
		<form onSubmit={handleSubmit} className="flex flex-col gap-3">
			<div className="flex flex-col gap-3">
				<WeightField
					value={draft.weight}
					onChange={(weight) => onUpdate({ ...draft, weight })}
					weightUnit={weightUnit}
					weightStep={weightStep}
				/>
				<RpeField
					value={draft.rpe}
					onChange={(rpe) => onUpdate({ ...draft, rpe })}
				/>
			</div>
			<footer className="flex items-center justify-end">
				<Button
					type="submit"
					intent="primary"
					size="sq-sm"
					isDisabled={isInvalid}
					aria-label="確定"
				>
					<CheckIcon data-slot="icon" className="size-4" aria-hidden />
				</Button>
			</footer>
		</form>
	);
};
