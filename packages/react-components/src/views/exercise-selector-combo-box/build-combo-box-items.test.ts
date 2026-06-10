import { beforeEach, describe, expect, test } from "vitest";
import {
	buildComboBoxItems,
	CREATE_ID,
	PLACEHOLDER_ID,
} from "./build-combo-box-items";

describe("buildComboBoxItems", () => {
	let options: { id: string; name: string }[];

	beforeEach(() => {
		options = [
			{ id: "1", name: "ベンチプレス" },
			{ id: "2", name: "スクワット" },
		];
	});

	describe("options が空かつクエリが空のとき", () => {
		test("empty プレースホルダのみが返ること", () => {
			expect(buildComboBoxItems({ options: [], query: "" })).toEqual([
				{ kind: "placeholder", id: PLACEHOLDER_ID, reason: "empty" },
			]);
		});
	});

	describe("options が空かつクエリが非空のとき", () => {
		test("empty プレースホルダ + create アイテムが返ること", () => {
			expect(buildComboBoxItems({ options: [], query: "新規" })).toEqual([
				{ kind: "placeholder", id: PLACEHOLDER_ID, reason: "empty" },
				{ kind: "create", id: CREATE_ID },
			]);
		});
	});

	describe("options が非空かつ絞り込み結果が空のとき", () => {
		test("no-match プレースホルダ + create アイテムが返ること", () => {
			expect(buildComboBoxItems({ options, query: "存在しない" })).toEqual([
				{ kind: "placeholder", id: PLACEHOLDER_ID, reason: "no-match" },
				{ kind: "create", id: CREATE_ID },
			]);
		});
	});

	describe("options が非空かつクエリが空のとき", () => {
		test("全 option のみが返ること", () => {
			expect(buildComboBoxItems({ options, query: "" })).toEqual([
				{ kind: "option", id: "1", name: "ベンチプレス" },
				{ kind: "option", id: "2", name: "スクワット" },
			]);
		});
	});

	describe("クエリが既存 name に部分一致するとき", () => {
		test("マッチした option + create アイテムが返ること", () => {
			expect(buildComboBoxItems({ options, query: "ベンチ" })).toEqual([
				{ kind: "option", id: "1", name: "ベンチプレス" },
				{ kind: "create", id: CREATE_ID },
			]);
		});
	});

	describe("クエリが既存 name と完全一致するとき", () => {
		test("マッチした option のみが返り、create アイテムは含まれないこと", () => {
			expect(buildComboBoxItems({ options, query: "ベンチプレス" })).toEqual([
				{ kind: "option", id: "1", name: "ベンチプレス" },
			]);
		});
	});
});
