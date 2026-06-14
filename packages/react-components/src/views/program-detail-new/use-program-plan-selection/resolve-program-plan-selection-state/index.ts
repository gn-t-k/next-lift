import type { Day } from "../../day-list";

export type UseProgramPlanSelectionState =
	| { level: "root" }
	| { level: "day"; dayId: string }
	| { level: "exercisePlan"; dayId: string; exercisePlanId: string };

export const resolveProgramPlanSelectionState = (
	days: Day[],
	preferred: UseProgramPlanSelectionState,
): UseProgramPlanSelectionState => {
	switch (preferred.level) {
		case "root":
			return { level: "root" };
		case "day": {
			const day = days.find((candidate) => candidate.id === preferred.dayId);
			if (day === undefined) {
				return { level: "root" };
			}
			return { level: "day", dayId: day.id };
		}
		case "exercisePlan": {
			const day = days.find((candidate) => candidate.id === preferred.dayId);
			if (day === undefined) {
				return { level: "root" };
			}
			const exercisePlan = day.exercisePlans.find(
				(candidate) => candidate.id === preferred.exercisePlanId,
			);
			if (exercisePlan === undefined) {
				return { level: "day", dayId: day.id };
			}
			return {
				level: "exercisePlan",
				dayId: day.id,
				exercisePlanId: exercisePlan.id,
			};
		}
	}
};
