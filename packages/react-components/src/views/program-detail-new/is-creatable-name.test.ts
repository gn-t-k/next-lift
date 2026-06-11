import { beforeEach, describe, expect, test } from "vitest";
import { isCreatableName } from "./is-creatable-name";

describe("isCreatableName", () => {
	let existingNames: string[];

	beforeEach(() => {
		existingNames = ["ベンチプレス", "スクワット"];
	});

	describe("クエリが空文字のとき", () => {
		test("false を返すこと", () => {
			expect(isCreatableName(existingNames, "")).toBe(false);
		});
	});

	describe("クエリが空白のみのとき", () => {
		test("false を返すこと", () => {
			expect(isCreatableName(existingNames, "   ")).toBe(false);
		});
	});

	describe("クエリが既存の名前と完全一致するとき", () => {
		test("false を返すこと", () => {
			expect(isCreatableName(existingNames, "ベンチプレス")).toBe(false);
		});
	});

	describe("クエリの前後の空白を trim すると既存の名前と一致するとき", () => {
		test("false を返すこと", () => {
			expect(isCreatableName(existingNames, "  ベンチプレス  ")).toBe(false);
		});
	});

	describe("クエリが既存の名前と一致しない非空文字列のとき", () => {
		test("true を返すこと", () => {
			expect(isCreatableName(existingNames, "新しい種目")).toBe(true);
		});
	});

	describe("クエリが既存の名前の部分文字列でしかないとき", () => {
		test("重複扱いにせず true を返すこと", () => {
			expect(isCreatableName(existingNames, "ベンチ")).toBe(true);
		});
	});
});
