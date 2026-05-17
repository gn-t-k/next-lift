import type { Pattern, SetPlanWithParams } from "../set-plan-types";

export type Draft = {
	pattern: Pattern;
	weight: number | null;
	reps: number | null;
	rpe: number | null;
};

export const makeInitialDraft = (
	initial: SetPlanWithParams | undefined,
): Draft => {
	if (initial === undefined) {
		return { pattern: "weight-reps", weight: null, reps: null, rpe: null };
	}
	switch (initial.pattern) {
		case "weight-reps":
			return {
				pattern: "weight-reps",
				weight: initial.weight,
				reps: initial.reps,
				rpe: null,
			};
		case "weight-rpe":
			return {
				pattern: "weight-rpe",
				weight: initial.weight,
				reps: null,
				rpe: initial.rpe,
			};
		case "reps-rpe":
			return {
				pattern: "reps-rpe",
				weight: null,
				reps: initial.reps,
				rpe: initial.rpe,
			};
	}
};

export const buildPayloadFromDraft = (
	draft: Draft,
): SetPlanWithParams | null => {
	switch (draft.pattern) {
		case "weight-reps":
			if (draft.weight === null || draft.reps === null) return null;
			return {
				pattern: "weight-reps",
				weight: draft.weight,
				reps: draft.reps,
			};
		case "weight-rpe":
			if (draft.weight === null || draft.rpe === null) return null;
			return {
				pattern: "weight-rpe",
				weight: draft.weight,
				rpe: draft.rpe,
			};
		case "reps-rpe":
			if (draft.reps === null || draft.rpe === null) return null;
			return { pattern: "reps-rpe", reps: draft.reps, rpe: draft.rpe };
	}
};
