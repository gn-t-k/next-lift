import { describe, expect, test } from "vitest";
import { computeScrollLeft } from "./compute-scroll-left";

describe("computeScrollLeft", () => {
	const baseGeometry = {
		containerWidth: 200,
		containerScrollLeft: 0,
		targetLeft: 500,
		targetWidth: 60,
	};

	describe("align: start", () => {
		test("ターゲットの左端がコンテナの左端に揃う位置を返すこと", () => {
			expect(computeScrollLeft(baseGeometry, "start")).toBe(500);
		});

		test("ターゲットが左端より前なら 0 にクランプされること", () => {
			expect(
				computeScrollLeft({ ...baseGeometry, targetLeft: -50 }, "start"),
			).toBe(0);
		});
	});

	describe("align: end", () => {
		test("ターゲットの右端がコンテナの右端に揃う位置を返すこと", () => {
			expect(computeScrollLeft(baseGeometry, "end")).toBe(360);
		});

		test("結果が負になるなら 0 にクランプされること", () => {
			expect(
				computeScrollLeft({ ...baseGeometry, targetLeft: 50 }, "end"),
			).toBe(0);
		});
	});

	describe("align: center", () => {
		test("ターゲットの中央がコンテナの中央に揃う位置を返すこと", () => {
			expect(computeScrollLeft(baseGeometry, "center")).toBe(430);
		});

		test("結果が負になるなら 0 にクランプされること", () => {
			expect(
				computeScrollLeft({ ...baseGeometry, targetLeft: 0 }, "center"),
			).toBe(0);
		});
	});

	describe("align: nearest", () => {
		describe("ターゲットが既にビュー内にあるとき", () => {
			test("現在の scrollLeft をそのまま返すこと", () => {
				expect(
					computeScrollLeft(
						{
							containerWidth: 200,
							containerScrollLeft: 480,
							targetLeft: 500,
							targetWidth: 60,
						},
						"nearest",
					),
				).toBe(480);
			});
		});

		describe("ターゲットがビューの左外にあるとき", () => {
			test("ターゲットの左端を左端に合わせる位置を返すこと", () => {
				expect(
					computeScrollLeft(
						{
							containerWidth: 200,
							containerScrollLeft: 600,
							targetLeft: 500,
							targetWidth: 60,
						},
						"nearest",
					),
				).toBe(500);
			});
		});

		describe("ターゲットがビューの右外にあるとき", () => {
			test("ターゲットの右端を右端に合わせる位置を返すこと", () => {
				expect(
					computeScrollLeft(
						{
							containerWidth: 200,
							containerScrollLeft: 0,
							targetLeft: 500,
							targetWidth: 60,
						},
						"nearest",
					),
				).toBe(360);
			});
		});
	});
});
