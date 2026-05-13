import type { SetPlanWithParams, WeightUnit } from "../set-plan-types";

export const formatQuickAddLabel = (
	setPlan: SetPlanWithParams,
	weightUnit: WeightUnit,
): string => {
	switch (setPlan.pattern) {
		case "weight-reps":
			return `${setPlan.weight}${weightUnit} × ${setPlan.reps}回を追加`;
		case "weight-rpe":
			return `${setPlan.weight}${weightUnit} @ RPE ${setPlan.rpe}を追加`;
		case "reps-rpe":
			return `${setPlan.reps}回 @ RPE ${setPlan.rpe}を追加`;
	}
};
