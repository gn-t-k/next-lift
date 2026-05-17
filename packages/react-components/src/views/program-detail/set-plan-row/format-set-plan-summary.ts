import type { SetPlanWithParams, WeightUnit } from "../set-plan-types";

export const formatSetPlanSummary = (
	setPlan: SetPlanWithParams,
	weightUnit: WeightUnit,
): string => {
	switch (setPlan.pattern) {
		case "weight-reps":
			return `${setPlan.weight}${weightUnit} × ${setPlan.reps}回`;
		case "weight-rpe":
			return `${setPlan.weight}${weightUnit} @ RPE ${setPlan.rpe}`;
		case "reps-rpe":
			return `${setPlan.reps}回 @ RPE ${setPlan.rpe}`;
	}
};
