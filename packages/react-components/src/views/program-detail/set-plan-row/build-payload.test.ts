import { describe, expect, test } from "vitest";
import { buildPayload } from "./build-payload";

describe("buildPayload", () => {
	describe("空配列のとき", () => {
		test("weight-x-reps の既定値（weight: 0, reps: 0）を返すこと", () => {
			expect(buildPayload("weight-x-reps", [])).toEqual({
				pattern: "weight-x-reps",
				weight: 0,
				reps: 0,
			});
		});
		test("weight-x-rpe の既定値（weight: 0, rpe: 8）を返すこと", () => {
			expect(buildPayload("weight-x-rpe", [])).toEqual({
				pattern: "weight-x-rpe",
				weight: 0,
				rpe: 8,
			});
		});
		test("reps-x-rpe の既定値（reps: 0, rpe: 8）を返すこと", () => {
			expect(buildPayload("reps-x-rpe", [])).toEqual({
				pattern: "reps-x-rpe",
				reps: 0,
				rpe: 8,
			});
		});
	});

	describe("直前セットの pattern が選択中パターンと一致するとき", () => {
		test("直前セットの値を継承すること（weight-x-reps）", () => {
			expect(
				buildPayload("weight-x-reps", [
					{ pattern: "weight-x-reps", weight: 100, reps: 5 },
				]),
			).toEqual({
				pattern: "weight-x-reps",
				weight: 100,
				reps: 5,
			});
		});
		test("複数セットあるとき末尾の値を継承すること", () => {
			expect(
				buildPayload("weight-x-reps", [
					{ pattern: "weight-x-reps", weight: 100, reps: 5 },
					{ pattern: "weight-x-reps", weight: 110, reps: 3 },
				]),
			).toEqual({
				pattern: "weight-x-reps",
				weight: 110,
				reps: 3,
			});
		});
		test("weight-x-rpe を継承すること", () => {
			expect(
				buildPayload("weight-x-rpe", [
					{ pattern: "weight-x-rpe", weight: 100, rpe: 9 },
				]),
			).toEqual({
				pattern: "weight-x-rpe",
				weight: 100,
				rpe: 9,
			});
		});
		test("reps-x-rpe を継承すること", () => {
			expect(
				buildPayload("reps-x-rpe", [
					{ pattern: "reps-x-rpe", reps: 12, rpe: 8 },
				]),
			).toEqual({
				pattern: "reps-x-rpe",
				reps: 12,
				rpe: 8,
			});
		});
	});

	describe("直前セットの pattern が選択中パターンと異なるとき", () => {
		test("選択中パターンの既定値を返すこと", () => {
			expect(
				buildPayload("reps-x-rpe", [
					{ pattern: "weight-x-reps", weight: 100, reps: 5 },
				]),
			).toEqual({
				pattern: "reps-x-rpe",
				reps: 0,
				rpe: 8,
			});
		});
	});

	describe("直前セットの pattern が null のとき", () => {
		test("選択中パターンの既定値を返すこと", () => {
			expect(buildPayload("weight-x-reps", [{ pattern: null }])).toEqual({
				pattern: "weight-x-reps",
				weight: 0,
				reps: 0,
			});
		});
	});
});
