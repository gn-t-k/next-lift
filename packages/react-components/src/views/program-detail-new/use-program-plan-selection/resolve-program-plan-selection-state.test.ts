import { describe, expect, test } from "vitest";
import type { Day } from "../day-list";
import {
	resolveProgramPlanSelectionState,
	type UseProgramPlanSelectionState,
} from "./resolve-program-plan-selection-state";

const days: Day[] = [
	{
		id: "d1",
		label: "Day 1",
		exercisePlans: [
			{
				id: "ep-1",
				exercise: {
					id: "ex-1",
					name: "ベンチプレス",
					weightUnit: "kg",
					weightStep: 2.5,
					detailHref: "/exercises/ex-1",
				},
				setPlans: [{ id: "sp-1", pattern: "weight-reps", weight: 60, reps: 5 }],
			},
		],
	},
	{
		id: "d2",
		label: "Day 2",
		exercisePlans: [],
	},
];

describe("resolveProgramPlanSelectionState", () => {
	describe("level: root", () => {
		test("そのまま root を返すこと", () => {
			const preferred: UseProgramPlanSelectionState = { level: "root" };
			expect(resolveProgramPlanSelectionState(days, preferred)).toEqual({
				level: "root",
			});
		});
	});

	describe("level: day", () => {
		test("存在する dayId なら day を返すこと", () => {
			const preferred: UseProgramPlanSelectionState = {
				level: "day",
				dayId: "d1",
			};
			expect(resolveProgramPlanSelectionState(days, preferred)).toEqual({
				level: "day",
				dayId: "d1",
			});
		});

		test("存在しない dayId なら root に降格すること", () => {
			const preferred: UseProgramPlanSelectionState = {
				level: "day",
				dayId: "missing",
			};
			expect(resolveProgramPlanSelectionState(days, preferred)).toEqual({
				level: "root",
			});
		});
	});

	describe("level: exercisePlan", () => {
		test("存在する dayId と exercisePlanId なら exercisePlan を返すこと", () => {
			const preferred: UseProgramPlanSelectionState = {
				level: "exercisePlan",
				dayId: "d1",
				exercisePlanId: "ep-1",
			};
			expect(resolveProgramPlanSelectionState(days, preferred)).toEqual({
				level: "exercisePlan",
				dayId: "d1",
				exercisePlanId: "ep-1",
			});
		});

		test("存在しない dayId なら root に降格すること", () => {
			const preferred: UseProgramPlanSelectionState = {
				level: "exercisePlan",
				dayId: "missing",
				exercisePlanId: "ep-1",
			};
			expect(resolveProgramPlanSelectionState(days, preferred)).toEqual({
				level: "root",
			});
		});

		test("存在しない exercisePlanId なら day に降格すること", () => {
			const preferred: UseProgramPlanSelectionState = {
				level: "exercisePlan",
				dayId: "d1",
				exercisePlanId: "missing",
			};
			expect(resolveProgramPlanSelectionState(days, preferred)).toEqual({
				level: "day",
				dayId: "d1",
			});
		});

		test("別 Day の exercisePlanId なら day に降格すること", () => {
			const preferred: UseProgramPlanSelectionState = {
				level: "exercisePlan",
				dayId: "d2",
				exercisePlanId: "ep-1",
			};
			expect(resolveProgramPlanSelectionState(days, preferred)).toEqual({
				level: "day",
				dayId: "d2",
			});
		});
	});
});
