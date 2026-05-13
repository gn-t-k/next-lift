import type { Pattern, SetPlanWithParams } from "../set-plan-types";

export const buildPayload = (
	pattern: Pattern,
	setPlans: readonly (SetPlanWithParams | { pattern: null })[],
): SetPlanWithParams => {
	const last = setPlans[setPlans.length - 1];
	if (last !== undefined && last.pattern === pattern) {
		switch (last.pattern) {
			case "weight-x-reps":
				return {
					pattern: "weight-x-reps",
					weight: last.weight,
					reps: last.reps,
				};
			case "weight-x-rpe":
				return {
					pattern: "weight-x-rpe",
					weight: last.weight,
					rpe: last.rpe,
				};
			case "reps-x-rpe":
				return { pattern: "reps-x-rpe", reps: last.reps, rpe: last.rpe };
		}
	}
	return defaultPayload(pattern);
};

const defaultPayload = (pattern: Pattern): SetPlanWithParams => {
	switch (pattern) {
		case "weight-x-reps":
			return { pattern: "weight-x-reps", weight: 0, reps: 0 };
		case "weight-x-rpe":
			return { pattern: "weight-x-rpe", weight: 0, rpe: 8 };
		case "reps-x-rpe":
			return { pattern: "reps-x-rpe", reps: 0, rpe: 8 };
	}
};
