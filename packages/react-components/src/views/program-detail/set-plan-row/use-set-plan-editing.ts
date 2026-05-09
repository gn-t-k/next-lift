"use client";

import { useState } from "react";

export type SetPlanPattern =
	| { kind: "weight-x-reps"; weight: number; reps: number }
	| { kind: "weight-x-rpe"; weight: number; rpe: number }
	| { kind: "reps-x-rpe"; reps: number; rpe: number };

export type SetPlanPatternKind = SetPlanPattern["kind"];

export type Draft =
	| { kind: "weight-x-reps"; weight: number | null; reps: number | null }
	| { kind: "weight-x-rpe"; weight: number | null; rpe: number | null }
	| { kind: "reps-x-rpe"; reps: number | null; rpe: number | null };

export const useSetPlanEditing = (
	pattern: SetPlanPattern | null,
	onChange: (pattern: SetPlanPattern) => void,
) => {
	const [draft, setDraft] = useState<Draft | null>(null);
	const start = () => setDraft(patternToDraft(pattern));
	const cancel = () => setDraft(null);
	const submit = () => {
		if (draft === null) return;
		const finalPattern = draftToPattern(draft);
		if (finalPattern === null) return;
		onChange(finalPattern);
		setDraft(null);
	};
	const handleOpenChange = (isOpen: boolean) => {
		if (!isOpen) cancel();
	};
	return {
		draft,
		setDraft,
		isOpen: draft !== null,
		start,
		cancel,
		submit,
		handleOpenChange,
	};
};

export const emptyDraftFor = (kind: SetPlanPatternKind): Draft => {
	switch (kind) {
		case "weight-x-reps":
			return { kind, weight: null, reps: null };
		case "weight-x-rpe":
			return { kind, weight: null, rpe: null };
		case "reps-x-rpe":
			return { kind, reps: null, rpe: null };
	}
};

export const draftToPattern = (draft: Draft): SetPlanPattern | null => {
	switch (draft.kind) {
		case "weight-x-reps":
			if (draft.weight === null || draft.reps === null) return null;
			return { kind: "weight-x-reps", weight: draft.weight, reps: draft.reps };
		case "weight-x-rpe":
			if (draft.weight === null || draft.rpe === null) return null;
			return { kind: "weight-x-rpe", weight: draft.weight, rpe: draft.rpe };
		case "reps-x-rpe":
			if (draft.reps === null || draft.rpe === null) return null;
			return { kind: "reps-x-rpe", reps: draft.reps, rpe: draft.rpe };
	}
};

export const normalizeNumber = (value: number): number | null =>
	Number.isNaN(value) ? null : value;

const patternToDraft = (pattern: SetPlanPattern | null): Draft => {
	if (pattern === null) {
		return emptyDraftFor("weight-x-reps");
	}
	return pattern;
};
