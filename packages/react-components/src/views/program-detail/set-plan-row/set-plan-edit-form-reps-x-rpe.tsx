"use client";

import { CheckIcon } from "@heroicons/react/24/solid";
import type { FC, FormEvent } from "react";
import { Button } from "../../../primitives/button";
import { RepsField, RpeField } from "./set-plan-edit-form-fields";

export type RepsXRpeDraft = {
	reps: number | null;
	rpe: number | null;
};

type Props = {
	draft: RepsXRpeDraft;
	onUpdate: (draft: RepsXRpeDraft) => void;
	onSubmit: () => void;
};

export const SetPlanEditFormRepsXRpe: FC<Props> = ({
	draft,
	onUpdate,
	onSubmit,
}) => {
	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		onSubmit();
	};
	const isInvalid = draft.reps === null || draft.rpe === null;
	return (
		<form onSubmit={handleSubmit} className="flex flex-col gap-3">
			<div className="flex flex-col gap-3">
				<RepsField
					value={draft.reps}
					onChange={(reps) => onUpdate({ ...draft, reps })}
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
