import { describe, expect, test } from "vitest";
import { formatQuickAddLabel } from "./format-quick-add-label";

describe("formatQuickAddLabel", () => {
	describe("pattern=weight-reps のとき", () => {
		test("kg 単位で重量×回数のラベルが返ること", () => {
			expect(
				formatQuickAddLabel(
					{ pattern: "weight-reps", weight: 100, reps: 5 },
					"kg",
				),
			).toBe("100kg × 5回を追加");
		});

		test("lbs 単位で重量×回数のラベルが返ること", () => {
			expect(
				formatQuickAddLabel(
					{ pattern: "weight-reps", weight: 225, reps: 5 },
					"lbs",
				),
			).toBe("225lbs × 5回を追加");
		});
	});

	describe("pattern=weight-rpe のとき", () => {
		test("重量×RPE のラベルが返ること", () => {
			expect(
				formatQuickAddLabel(
					{ pattern: "weight-rpe", weight: 100, rpe: 9 },
					"kg",
				),
			).toBe("100kg @ RPE 9を追加");
		});
	});

	describe("pattern=reps-rpe のとき", () => {
		test("回数×RPE のラベルが返ること（重量単位は無関係）", () => {
			expect(
				formatQuickAddLabel({ pattern: "reps-rpe", reps: 12, rpe: 8 }, "kg"),
			).toBe("12回 @ RPE 8を追加");
		});
	});
});
