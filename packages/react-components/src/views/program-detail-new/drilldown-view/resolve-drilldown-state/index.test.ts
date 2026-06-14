import { describe, expect, test } from "vitest";
import type { Day } from "../../day-list";
import type { UseProgramPlanSelectionState } from "../../use-program-plan-selection";
import { resolveDrilldownState } from "./index";

const days: Day[] = [
	{
		id: "d1",
		label: "Day 1",
		meta: undefined,
		exercisePlans: [
			{
				id: "ep-1",
				meta: undefined,
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
		meta: undefined,
		exercisePlans: [],
	},
];

describe("resolveDrilldownState", () => {
	describe("level: root", () => {
		test("Day 一覧（drilldown の day レベル）を返すこと", () => {
			const selectionState: UseProgramPlanSelectionState = { level: "root" };
			expect(resolveDrilldownState(days, selectionState)).toEqual({
				level: "day",
			});
		});
	});

	describe("level: day", () => {
		test("存在する dayId なら exercise レベルと Day を返すこと", () => {
			const selectionState: UseProgramPlanSelectionState = {
				level: "day",
				dayId: "d1",
			};
			expect(resolveDrilldownState(days, selectionState)).toEqual({
				level: "exercise",
				day: days[0],
			});
		});

		test("存在しない dayId なら day レベルに縮退すること", () => {
			const selectionState: UseProgramPlanSelectionState = {
				level: "day",
				dayId: "missing",
			};
			expect(resolveDrilldownState(days, selectionState)).toEqual({
				level: "day",
			});
		});
	});

	describe("level: exercisePlan", () => {
		test("存在する dayId と exercisePlanId なら set レベルを返すこと", () => {
			const selectionState: UseProgramPlanSelectionState = {
				level: "exercisePlan",
				dayId: "d1",
				exercisePlanId: "ep-1",
			};
			expect(resolveDrilldownState(days, selectionState)).toEqual({
				level: "set",
				day: days[0],
				exercisePlan: days[0]?.exercisePlans[0],
			});
		});

		test("存在しない dayId なら day レベルに縮退すること", () => {
			const selectionState: UseProgramPlanSelectionState = {
				level: "exercisePlan",
				dayId: "missing",
				exercisePlanId: "ep-1",
			};
			expect(resolveDrilldownState(days, selectionState)).toEqual({
				level: "day",
			});
		});

		test("存在しない exercisePlanId なら exercise レベルに縮退すること", () => {
			const selectionState: UseProgramPlanSelectionState = {
				level: "exercisePlan",
				dayId: "d1",
				exercisePlanId: "missing",
			};
			expect(resolveDrilldownState(days, selectionState)).toEqual({
				level: "exercise",
				day: days[0],
			});
		});

		test("別 Day の exercisePlanId なら exercise レベルに縮退すること", () => {
			const selectionState: UseProgramPlanSelectionState = {
				level: "exercisePlan",
				dayId: "d2",
				exercisePlanId: "ep-1",
			};
			expect(resolveDrilldownState(days, selectionState)).toEqual({
				level: "exercise",
				day: days[1],
			});
		});
	});
});
