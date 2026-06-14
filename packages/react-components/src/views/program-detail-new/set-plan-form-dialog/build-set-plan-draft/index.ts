import type { WeightUnit } from "../../exercise-plan-list";
import type { SetPlan, SetPlanDraft } from "../../set-plan-list";

// Tab間で値を共有するための型
export type FormState = {
	pattern: SetPlan["pattern"];
	weight: number | null;
	reps: number | null;
	rpe: number | null;
};

type BuildResult =
	| { valid: true; setPlanDraft: SetPlanDraft }
	| { valid: false };

export const makeInitialFormState = (
	initial: SetPlanDraft | undefined,
): FormState => {
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

export const buildSetPlanDraft = (formState: FormState): BuildResult => {
	switch (formState.pattern) {
		case "weight-reps":
			if (formState.weight === null || formState.reps === null) {
				return { valid: false };
			}
			return {
				valid: true,
				setPlanDraft: {
					pattern: "weight-reps",
					weight: formState.weight,
					reps: formState.reps,
				},
			};
		case "weight-rpe":
			if (formState.weight === null || formState.rpe === null) {
				return { valid: false };
			}
			return {
				valid: true,
				setPlanDraft: {
					pattern: "weight-rpe",
					weight: formState.weight,
					rpe: formState.rpe,
				},
			};
		case "reps-rpe":
			if (formState.reps === null || formState.rpe === null) {
				return { valid: false };
			}
			return {
				valid: true,
				setPlanDraft: {
					pattern: "reps-rpe",
					reps: formState.reps,
					rpe: formState.rpe,
				},
			};
	}
};

export type { SetPlan, SetPlanDraft, WeightUnit };
