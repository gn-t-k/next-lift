import type { Day } from "../../day-list";
import type { ExercisePlan } from "../../exercise-plan-list";
import type { UseProgramPlanSelectionState } from "../../use-program-plan-selection";

export type DrilldownState =
	| { level: "day" }
	| { level: "exercise"; day: Day }
	| { level: "set"; day: Day; exercisePlan: ExercisePlan };

export const resolveDrilldownState = (
	days: Day[],
	selectionState: UseProgramPlanSelectionState,
): DrilldownState => {
	switch (selectionState.level) {
		case "root":
			return { level: "day" };
		case "day": {
			const day = days.find(
				(candidate) => candidate.id === selectionState.dayId,
			);
			if (day === undefined) {
				return { level: "day" };
			}
			return { level: "exercise", day };
		}
		case "exercisePlan": {
			const day = days.find(
				(candidate) => candidate.id === selectionState.dayId,
			);
			const exercisePlan = day?.exercisePlans.find(
				(candidate) => candidate.id === selectionState.exercisePlanId,
			);
			if (day === undefined) {
				return { level: "day" };
			}
			if (exercisePlan === undefined) {
				return { level: "exercise", day };
			}
			return { level: "set", day, exercisePlan };
		}
	}
};
