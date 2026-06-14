"use client";

import { useRef, useState } from "react";
import type { SetPlan, SetPlanDraft } from "../set-plan-types";
import {
	buildSetPlanDraft,
	type FormState,
	makeInitialFormState,
} from "./build-set-plan-draft";

type Params = {
	initial: SetPlanDraft | undefined;
	onSubmit: (payload: SetPlanDraft) => void;
};

type State = {
	pattern: SetPlan["pattern"];
	weight: number | null;
	reps: number | null;
	rpe: number | null;
	isCommitDisabled: boolean;
};

type Actions = {
	setPattern: (next: SetPlan["pattern"]) => void;
	setWeight: (next: number | null) => void;
	setReps: (next: number | null) => void;
	setRpe: (next: number | null) => void;
	commit: () => void;
	reset: () => void;
};

export const useSetPlanForm = ({
	initial,
	onSubmit,
}: Params): [State, Actions] => {
	const [formState, setFormState] = useState<FormState>(() =>
		makeInitialFormState(initial),
	);
	// blur で更新された formState を同一ハンドラ内で同期的に読むため、ref に持つ
	const formStateRef = useRef<FormState>(makeInitialFormState(initial));

	const writeFormState = (next: FormState) => {
		formStateRef.current = next;
		setFormState(next);
	};

	const reset = () => {
		const init = makeInitialFormState(initial);
		formStateRef.current = init;
		setFormState(init);
	};

	const commit = () => {
		// 確定ボタンのマウスクリックでも focused input の blur が発火しないため、 明示的に blur して NumberField の値を commit させてから draft を組む
		blurActiveInput();
		const result = buildSetPlanDraft(formStateRef.current);
		if (result.valid) {
			onSubmit(result.setPlanDraft);
		}
	};

	const setPattern = (next: SetPlan["pattern"]) => {
		// Tab マウスクリックでも focused input の blur が発火しないため、
		// TabPanel が unmount される前に明示的に blur して値を commit させる
		blurActiveInput();
		writeFormState({ ...formStateRef.current, pattern: next });
	};

	const setWeight = (next: number | null) => {
		writeFormState({ ...formStateRef.current, weight: next });
	};

	const setReps = (next: number | null) => {
		writeFormState({ ...formStateRef.current, reps: next });
	};

	const setRpe = (next: number | null) => {
		writeFormState({ ...formStateRef.current, rpe: next });
	};

	const isCommitDisabled = !buildSetPlanDraft(formState).valid;

	return [
		{
			pattern: formState.pattern,
			weight: formState.weight,
			reps: formState.reps,
			rpe: formState.rpe,
			isCommitDisabled,
		},
		{ setPattern, setWeight, setReps, setRpe, commit, reset },
	];
};

const blurActiveInput = () => {
	if (document.activeElement instanceof HTMLInputElement) {
		document.activeElement.blur();
	}
};
