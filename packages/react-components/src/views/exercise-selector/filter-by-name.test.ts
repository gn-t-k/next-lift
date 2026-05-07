import { beforeEach, describe, expect, test } from "vitest";
import { filterByName } from "./filter-by-name";

describe("filterByName", () => {
	let items: { id: string; name: string }[];

	beforeEach(() => {
		items = [
			{ id: "1", name: "ベンチプレス" },
			{ id: "2", name: "インクラインダンベルプレス" },
			{ id: "3", name: "Squat" },
		];
	});

	describe("クエリが空文字のとき", () => {
		test("入力をそのまま返すこと", () => {
			expect(filterByName(items, "")).toEqual(items);
		});
	});

	describe("クエリが空白のみのとき", () => {
		test("入力をそのまま返すこと", () => {
			expect(filterByName(items, "   ")).toEqual(items);
		});
	});

	describe("クエリが name に部分一致するとき", () => {
		test("マッチする項目だけが返ること", () => {
			expect(filterByName(items, "プレス")).toEqual([
				{ id: "1", name: "ベンチプレス" },
				{ id: "2", name: "インクラインダンベルプレス" },
			]);
		});
	});

	describe("クエリと name の大文字小文字が異なるとき", () => {
		test("大文字小文字を無視してマッチすること", () => {
			expect(filterByName(items, "squat")).toEqual([
				{ id: "3", name: "Squat" },
			]);
		});
	});

	describe("クエリの前後に空白があるとき", () => {
		test("空白を無視してマッチすること", () => {
			expect(filterByName(items, "  ベンチ  ")).toEqual([
				{ id: "1", name: "ベンチプレス" },
			]);
		});
	});

	describe("クエリにマッチする項目がないとき", () => {
		test("空配列が返ること", () => {
			expect(filterByName(items, "存在しない")).toEqual([]);
		});
	});
});
