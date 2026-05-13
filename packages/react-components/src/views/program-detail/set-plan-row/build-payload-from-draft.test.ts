import { describe, expect, test } from "vitest";
import {
	buildPayloadFromDraft,
	type Draft,
	makeInitialDraft,
} from "./build-payload-from-draft";

describe("makeInitialDraft", () => {
	describe("initial が undefined のとき", () => {
		test("pattern=weight-reps、値はすべて null の draft が返ること", () => {
			expect(makeInitialDraft(undefined)).toEqual({
				pattern: "weight-reps",
				weight: null,
				reps: null,
				rpe: null,
			});
		});
	});

	describe("initial が weight-reps のとき", () => {
		test("pattern と weight / reps を引き継ぎ、rpe は null になること", () => {
			expect(
				makeInitialDraft({ pattern: "weight-reps", weight: 100, reps: 5 }),
			).toEqual({ pattern: "weight-reps", weight: 100, reps: 5, rpe: null });
		});
	});

	describe("initial が weight-rpe のとき", () => {
		test("pattern と weight / rpe を引き継ぎ、reps は null になること", () => {
			expect(
				makeInitialDraft({ pattern: "weight-rpe", weight: 100, rpe: 9 }),
			).toEqual({ pattern: "weight-rpe", weight: 100, reps: null, rpe: 9 });
		});
	});

	describe("initial が reps-rpe のとき", () => {
		test("pattern と reps / rpe を引き継ぎ、weight は null になること", () => {
			expect(
				makeInitialDraft({ pattern: "reps-rpe", reps: 12, rpe: 8 }),
			).toEqual({ pattern: "reps-rpe", weight: null, reps: 12, rpe: 8 });
		});
	});
});

describe("buildPayloadFromDraft", () => {
	describe("pattern=weight-reps のとき", () => {
		test("weight と reps が両方入っていれば payload が返ること", () => {
			const draft: Draft = {
				pattern: "weight-reps",
				weight: 100,
				reps: 5,
				rpe: null,
			};
			expect(buildPayloadFromDraft(draft)).toEqual({
				pattern: "weight-reps",
				weight: 100,
				reps: 5,
			});
		});

		test("weight が null のとき null が返ること", () => {
			const draft: Draft = {
				pattern: "weight-reps",
				weight: null,
				reps: 5,
				rpe: null,
			};
			expect(buildPayloadFromDraft(draft)).toBeNull();
		});

		test("reps が null のとき null が返ること", () => {
			const draft: Draft = {
				pattern: "weight-reps",
				weight: 100,
				reps: null,
				rpe: null,
			};
			expect(buildPayloadFromDraft(draft)).toBeNull();
		});
	});

	describe("pattern=weight-rpe のとき", () => {
		test("weight と rpe が両方入っていれば payload が返ること", () => {
			const draft: Draft = {
				pattern: "weight-rpe",
				weight: 100,
				reps: null,
				rpe: 9,
			};
			expect(buildPayloadFromDraft(draft)).toEqual({
				pattern: "weight-rpe",
				weight: 100,
				rpe: 9,
			});
		});

		test("weight が null のとき null が返ること", () => {
			const draft: Draft = {
				pattern: "weight-rpe",
				weight: null,
				reps: null,
				rpe: 9,
			};
			expect(buildPayloadFromDraft(draft)).toBeNull();
		});

		test("rpe が null のとき null が返ること", () => {
			const draft: Draft = {
				pattern: "weight-rpe",
				weight: 100,
				reps: null,
				rpe: null,
			};
			expect(buildPayloadFromDraft(draft)).toBeNull();
		});
	});

	describe("pattern=reps-rpe のとき", () => {
		test("reps と rpe が両方入っていれば payload が返ること", () => {
			const draft: Draft = {
				pattern: "reps-rpe",
				weight: null,
				reps: 12,
				rpe: 8,
			};
			expect(buildPayloadFromDraft(draft)).toEqual({
				pattern: "reps-rpe",
				reps: 12,
				rpe: 8,
			});
		});

		test("reps が null のとき null が返ること", () => {
			const draft: Draft = {
				pattern: "reps-rpe",
				weight: null,
				reps: null,
				rpe: 8,
			};
			expect(buildPayloadFromDraft(draft)).toBeNull();
		});

		test("rpe が null のとき null が返ること", () => {
			const draft: Draft = {
				pattern: "reps-rpe",
				weight: null,
				reps: 12,
				rpe: null,
			};
			expect(buildPayloadFromDraft(draft)).toBeNull();
		});

		test("pattern と関係ない weight が入っていても無視されること", () => {
			const draft: Draft = {
				pattern: "reps-rpe",
				weight: 100,
				reps: 12,
				rpe: 8,
			};
			expect(buildPayloadFromDraft(draft)).toEqual({
				pattern: "reps-rpe",
				reps: 12,
				rpe: 8,
			});
		});
	});
});
