import { describe, expect, test } from "vitest";
import { formatSetPlanSummary } from "./format-set-plan-summary";

describe("formatSetPlanSummary", () => {
	describe("pattern=weight-reps のとき", () => {
		test("kg 単位で重量×回数のサマリが返ること", () => {
			expect(
				formatSetPlanSummary(
					{ pattern: "weight-reps", weight: 100, reps: 5 },
					"kg",
				),
			).toBe("100kg × 5回");
		});

		test("lbs 単位で重量×回数のサマリが返ること", () => {
			expect(
				formatSetPlanSummary(
					{ pattern: "weight-reps", weight: 225, reps: 5 },
					"lbs",
				),
			).toBe("225lbs × 5回");
		});
	});

	describe("pattern=weight-rpe のとき", () => {
		test("重量×RPE のサマリが返ること", () => {
			expect(
				formatSetPlanSummary(
					{ pattern: "weight-rpe", weight: 100, rpe: 9 },
					"kg",
				),
			).toBe("100kg @ RPE 9");
		});
	});

	describe("pattern=reps-rpe のとき", () => {
		test("回数×RPE のサマリが返ること（重量単位は無関係）", () => {
			expect(
				formatSetPlanSummary({ pattern: "reps-rpe", reps: 12, rpe: 8 }, "kg"),
			).toBe("12回 @ RPE 8");
		});
	});
});
