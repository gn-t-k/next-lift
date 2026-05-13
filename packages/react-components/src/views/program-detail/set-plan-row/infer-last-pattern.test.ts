import { describe, expect, test } from "vitest";
import { inferLastPattern } from "./infer-last-pattern";

describe("inferLastPattern", () => {
	describe("空配列のとき", () => {
		test("null を返すこと", () => {
			expect(inferLastPattern([])).toBeNull();
		});
	});
	describe("末尾の pattern が null のとき", () => {
		test("null を返すこと", () => {
			expect(
				inferLastPattern([{ pattern: "weight-x-reps" }, { pattern: null }]),
			).toBeNull();
		});
	});
	describe("末尾の pattern が値を持つとき", () => {
		test("その pattern を返すこと", () => {
			expect(inferLastPattern([{ pattern: "weight-x-rpe" }])).toBe(
				"weight-x-rpe",
			);
		});
		test("複数要素のとき末尾の pattern を返すこと", () => {
			expect(
				inferLastPattern([
					{ pattern: "weight-x-reps" },
					{ pattern: "reps-x-rpe" },
				]),
			).toBe("reps-x-rpe");
		});
	});
});
