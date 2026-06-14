import { describe, expect, test } from "vitest";
import {
	buildSetPlanDraft,
	type FormState,
	makeInitialFormState,
} from "./index";

describe("makeInitialFormState", () => {
	describe("initial が undefined のとき", () => {
		test("pattern=weight-reps、値はすべて null の formState が返ること", () => {
			expect(makeInitialFormState(undefined)).toEqual({
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
				makeInitialFormState({ pattern: "weight-reps", weight: 100, reps: 5 }),
			).toEqual({ pattern: "weight-reps", weight: 100, reps: 5, rpe: null });
		});
	});

	describe("initial が weight-rpe のとき", () => {
		test("pattern と weight / rpe を引き継ぎ、reps は null になること", () => {
			expect(
				makeInitialFormState({ pattern: "weight-rpe", weight: 100, rpe: 9 }),
			).toEqual({ pattern: "weight-rpe", weight: 100, reps: null, rpe: 9 });
		});
	});

	describe("initial が reps-rpe のとき", () => {
		test("pattern と reps / rpe を引き継ぎ、weight は null になること", () => {
			expect(
				makeInitialFormState({ pattern: "reps-rpe", reps: 12, rpe: 8 }),
			).toEqual({ pattern: "reps-rpe", weight: null, reps: 12, rpe: 8 });
		});
	});
});

describe("buildSetPlanDraft", () => {
	describe("pattern=weight-reps のとき", () => {
		test("weight と reps が両方入っていれば valid な result が返ること", () => {
			const formState: FormState = {
				pattern: "weight-reps",
				weight: 100,
				reps: 5,
				rpe: null,
			};
			expect(buildSetPlanDraft(formState)).toEqual({
				valid: true,
				setPlanDraft: { pattern: "weight-reps", weight: 100, reps: 5 },
			});
		});

		test("weight が null のとき invalid な result が返ること", () => {
			const formState: FormState = {
				pattern: "weight-reps",
				weight: null,
				reps: 5,
				rpe: null,
			};
			expect(buildSetPlanDraft(formState)).toEqual({ valid: false });
		});

		test("reps が null のとき invalid な result が返ること", () => {
			const formState: FormState = {
				pattern: "weight-reps",
				weight: 100,
				reps: null,
				rpe: null,
			};
			expect(buildSetPlanDraft(formState)).toEqual({ valid: false });
		});
	});

	describe("pattern=weight-rpe のとき", () => {
		test("weight と rpe が両方入っていれば valid な result が返ること", () => {
			const formState: FormState = {
				pattern: "weight-rpe",
				weight: 100,
				reps: null,
				rpe: 9,
			};
			expect(buildSetPlanDraft(formState)).toEqual({
				valid: true,
				setPlanDraft: { pattern: "weight-rpe", weight: 100, rpe: 9 },
			});
		});

		test("weight が null のとき invalid な result が返ること", () => {
			const formState: FormState = {
				pattern: "weight-rpe",
				weight: null,
				reps: null,
				rpe: 9,
			};
			expect(buildSetPlanDraft(formState)).toEqual({ valid: false });
		});

		test("rpe が null のとき invalid な result が返ること", () => {
			const formState: FormState = {
				pattern: "weight-rpe",
				weight: 100,
				reps: null,
				rpe: null,
			};
			expect(buildSetPlanDraft(formState)).toEqual({ valid: false });
		});
	});

	describe("pattern=reps-rpe のとき", () => {
		test("reps と rpe が両方入っていれば valid な result が返ること", () => {
			const formState: FormState = {
				pattern: "reps-rpe",
				weight: null,
				reps: 12,
				rpe: 8,
			};
			expect(buildSetPlanDraft(formState)).toEqual({
				valid: true,
				setPlanDraft: { pattern: "reps-rpe", reps: 12, rpe: 8 },
			});
		});

		test("reps が null のとき invalid な result が返ること", () => {
			const formState: FormState = {
				pattern: "reps-rpe",
				weight: null,
				reps: null,
				rpe: 8,
			};
			expect(buildSetPlanDraft(formState)).toEqual({ valid: false });
		});

		test("rpe が null のとき invalid な result が返ること", () => {
			const formState: FormState = {
				pattern: "reps-rpe",
				weight: null,
				reps: 12,
				rpe: null,
			};
			expect(buildSetPlanDraft(formState)).toEqual({ valid: false });
		});

		test("pattern と関係ない weight が入っていても無視されること", () => {
			const formState: FormState = {
				pattern: "reps-rpe",
				weight: 100,
				reps: 12,
				rpe: 8,
			};
			expect(buildSetPlanDraft(formState)).toEqual({
				valid: true,
				setPlanDraft: { pattern: "reps-rpe", reps: 12, rpe: 8 },
			});
		});
	});
});
